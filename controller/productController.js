
const mongoose = require('mongoose');
const Product = require("../model/product");
const { CREATED, OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = require('http-status-codes')
const {deleteSingleFile} = require('../helper/helper')
const _ = require("underscore");
/* product crud apis */
const ProductController = {
    productAdd: async (req, res) => {
        try {
            const file = req?.files
            const input = {
                name: req?.body?.name?.trim(),
                categoryId: req?.body?.categoryId,
                name: req?.body?.name?.trim(),
                description: req?.body?.description?.trim(),
                price: req?.body?.price
            }
            if(file?.image)
            {
                input.image = 'products/'+file?.image?.[0]?.filename
            }
            const exist = await Product.findOne({ name: input.name })
            if (exist) {
                return res.status(BAD_REQUEST).json({ message: "Product already exist!" });
            }
            const add = await Product.create(input)
            return res.status(CREATED).json({ message: "Product save succesfully!" });
        }
        catch (err) {
            return res.status(INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    },
    productUpdate: async (req, res) => {
        try {
            let { id } = req.query;
            const file = req?.files
            const input = {
                name: req?.body?.name?.trim(),
                categoryId: req?.body?.categoryId,
                name: req?.body?.name?.trim(),
                description: req?.body?.description?.trim(),
                price: req?.body?.price,
                isActive: req?.body?.isActive || false
            }
            let exist = await Product.findOne({ name: input?.name,_id: { $ne: new mongoose.Types.ObjectId(id) } });
            if (exist) {
                return res.status(BAD_REQUEST).json({ message: "Product already exist!" });
            }
            let OldProduct = await Product.findOne({_id : new mongoose.Types.ObjectId(id)});
            
            if(file?.image)
            {
                input.image = 'products/'+file?.image?.[0]?.filename
                if(OldProduct?.image!=input?.image)
                {
                    await deleteSingleFile(OldProduct?.image,'public/')
                }
            }
            await Product.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: input })
            return res.status(OK).json({ message: "Product updated successfully!" });
        }
        catch (err) {
            // console.log(err)
            return res.status(INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    },

    getProduct: async (req, res) => {
        try {
            let { search, page } = req.query;
            page= page || 1
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit || 0;
            const total_ = await Product.find({}).sort({ created_at: -1 }).countDocuments();

            let filter = {};
            if (search) {
                filter = {
                    name: { $regex: search, $options: "i" }
                }
            }

            const categories = await Product.aggregate([
                { $match: filter },
                { $sort: { createdAt: -1 } },
                {
                    $facet: {
                        metadata: [
                            { $count: "total" },
                            {
                                $addFields: {
                                    page: page,
                                    limit: limit,
                                    total: total_,
                                    hasMoreData: total_ > page * limit ? true : false
                                }
                            }
                        ],
                        data: [
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    image: 1,
                                    description: 1,
                                    price: 1,
                                    isActive: 1
                                }
                            }
                        ]
                    }
                }
            ])
            return res.status(OK).json({status: true, data: categories});
        }
        catch (err) {
            return res.status(INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    },
    deleteProduct: async (req, res) => {
        try {
            let id = req.query;
            const productData = await Product.findOne({_id: new mongoose.Types.ObjectId(id)} );
            const product = await Product.deleteOne({_id: new mongoose.Types.ObjectId(id)} );
            if (product) {
                if(productData?.image && productData?.image!=""){
                    await deleteSingleFile(productData?.image,'public/')
                }
                return  res.status(BAD_REQUEST).json({ message: "Product delete succesfully!" });
            } else {
                return res.status(INTERNAL_SERVER_ERROR).json({ message: "Product not found!" }, 401);
            }
        }
        catch (err) {
            return res.status(INTERNAL_SERVER_ERROR).json({ message: err.message }, 401);
        }
    }
}

module.exports = ProductController