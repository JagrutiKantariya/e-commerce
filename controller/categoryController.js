
const mongoose = require('mongoose');
const Category = require("../model/category");
const { CREATED, OK, INTERNAL_SERVER_ERROR, BAD_REQUEST } = require('http-status-codes')
const _ = require("underscore");
const categoryController = {
    categoryAdd: async (req, res) => {
        try {
            const input = {
                name: req?.body?.name?.trim()
            }
            const exist = await Category.findOne({ name: input.name })
            if (exist) {
                return res.status(BAD_REQUEST).json({ message: "Category already exist!" });
            }
            const add = await Category.create(input)
            return res.status(CREATED).json({ message: "Category save succesfully!" });
        }
        catch (err) {
            return res.status(INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    },
    categoryUpdate: async (req, res) => {
        try {
            let { id } = req.query;
            const input = {
                name: req?.body?.name?.trim(),
                isActive: Boolean(req?.body?.isActive || false)
            }
            
            let exist = await Category.findOne({ name: input?.name,_id: { $ne: new mongoose.Types.ObjectId(id) } });
            if (exist) {
                return res.status(BAD_REQUEST).json({ message: "Category already exist!" });
            }
            await Category.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: input })
            return res.status(OK).json({ message: "Category updated successfully!" });
        }
        catch (err) {
            // console.log(err)
            return res.status(INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    },

    getCategory: async (req, res) => {
        try {
            let { search, page } = req.query;
            page= page || 1
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit || 0;
            const total_ = await Category.find({}).sort({ created_at: -1 }).countDocuments();

            let filter = {};
            if (search) {
                filter = {
                    name: { $regex: search, $options: "i" }
                }
            }

            const categories = await Category.aggregate([
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
    deleteCategory: async (req, res) => {
        try {
            let id = req.query;
            const category = await Category.deleteOne({_id: new mongoose.Types.ObjectId(id)} );
            if (category) {
                return  res.status(BAD_REQUEST).json({ message: "category deleted successfully!" });
            } else {
                return res.status(INTERNAL_SERVER_ERROR).json({ message: "category not found!" }, 401);
            }
        }
        catch (err) {
            return res.status(INTERNAL_SERVER_ERROR).json({ message: err.message }, 401);
        }
    }
}

module.exports = categoryController