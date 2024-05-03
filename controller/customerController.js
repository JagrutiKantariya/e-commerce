const { CREATED, OK, INTERNAL_SERVER_ERROR, BAD_REQUEST, BAD_GATEWAY } = require('http-status-codes')
const Customer = require('../model/customer')
const cartItem = require('../model/cartItem')
const cart = require('../model/cart')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { JWT_ACCESS_SECRET, JWT_ACCESS_TIME, PUBLISHER_KEY, SECRET_KEY } = require('../config')
const product = require('../model/product')
const Order = require('../model/order')
const stripe = require('stripe')(SECRET_KEY);
function calculateTotalPrice(items) {
    let totalPrice = 0;
    items.forEach(item => {
        if (item.price) {
            totalPrice += item.price * item.quantity;
        }
    });
    return totalPrice;
}
const adminController = {
    signUp: async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        if (!email) return res.status(BAD_REQUEST).json({ status: false, message: "email is required" });

        const customer = await Customer.findOne({ email })

        if (!customer) {
            const customer = await stripe.customers.create({
                email: req.body.username?.[UserData.EMAIL.toString()],
                description: 'E-comerce Customer',
            });
            const input = {
                email: email,
                password: password,
                stripeId:customer._id
            }
            await customer.create(input)
        }else{
        
            return res.status(BAD_REQUEST).json({ status: false, message: "email already exist!" });

        }

        return res.status(OK).json({ status: true, message:"reg success" })
    },
    login: async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        if (!email) return res.status(BAD_REQUEST).json({ status: false, message: "email is required" });

        const customer = await Customer.findOne({ email })

        if (!customer) return res.status(BAD_REQUEST).json({ message: 'email not found! please sign up' });
        

        const valid_password = await bcrypt.compare(password, customer.password);
        if (!valid_password) {

            return res.status(BAD_REQUEST).json({ status: false, message: 'invalid password!' });
        }
        if(!customer?.stripeId ||customer?.stripeId==null ){
            const customer = await stripe.customers.create({
                email: req.body.username?.[UserData.EMAIL.toString()],
                description: 'E-comerce Customer',
            });
            await Customer.stripeId({_id:Customer?._id },{$set:customer._id})
        }
        const accessToken = jwt.sign({ name: customer?.name, email: customer?.email }, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_TIME });
        
        res.user = customer?._id?.toString()
        const data = {
            name: customer.name,
            accessToken: accessToken
        }

        return res.status(OK).json({ status: true, data })
    },
    addToCart: async (req, res) => {
        try {
            const { deviceId, productId, quantity } = req?.body
            if (!deviceId) return res.status(BAD_REQUEST).json({ status: false, message: "deviceId is required" });
            if (!productId) return res.status(BAD_REQUEST).json({ status: false, message: "productId is required" });
            if (!quantity) return res.status(BAD_REQUEST).json({ status: false, message: "quantity is required" });

            const productExist = await product.findOne({ _id: new mongoose.Types.ObjectId(productId) })
            if (!productExist) return res.status(BAD_REQUEST).json({ status: false, message: "productId not exist" });
            const customerExist = await Customer.findOne({ deviceId: deviceId });
            if (!customerExist) {
                const customerData = await Customer.create({ deviceId: deviceId })
                const input = { customer: customerData?._id, items: [{ product: productId, quantity: quantity, price: quantity * productExist?.price }] }

                await cart.create(input)
            } else {
                const cartExist = await cart.findOne({ customer: customerExist?._id })
                if (cartExist) {

                    await cart.updateOne({ customer: customerExist?._id }, { $push: { items: { product: productId, quantity: quantity, price: quantity * productExist?.price } } })
                } else {
                    const input = { customer: customerExist?._id, items: [{ product: productId, quantity: quantity, price: quantity * productExist?.price }] }

                    await cart.create(input)
                }
            }
            return res.status(OK).json({ status: true, message: 'product added to cart succesfully!' })
        }
        catch (error) {
            console.log(error)
            return res.status(INTERNAL_SERVER_ERROR).json({ status: false, message: error.message })

        }

    },
    getCart: async (req, res) => {
        try {
            // write get cart logic here
            const data = await cart.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.product',
                        foreignField: '_id',
                        as: 'items'
                    }
                },
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'customer',
                        foreignField: '_id',
                        as: 'customer'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        items: 1,
                        customer: 1
                    }
                }
            ])
            return res.status(OK).json({ status: true, message: 'cart retrieve successfully!', data: data })
        }
        catch (error) {
            console.log(error)
            return res.status(INTERNAL_SERVER_ERROR).json({ status: false, message: error.message })

        }

    }, 
    placeOrder: async (req, res) => {
        try {
            const customerId = req?.user
            // need to login before customer pay
            if (!customerId) {
                return res.status(BAD_REQUEST).json({ status: false, message: 'login in requied to place your order!' })
            }
            const cartData = await cart.findOne({ customer: new mongoose.Types.ObjectId(customer?._id) })
            const total_amount = calculateTotalPrice(cartData?.items)
            let charge_object = {
                amount: Math.round(total_amount * 100),
                currency: 'GBP',
                source: source || null,
                description: 'My First Test Charge for order place'
            }
            const charge = await stripe.charges.create(charge_object); // here charge is generated for order
            const charge_id = charge.id;
            await Order.create({ customer: customer?._id, items: cartData?.items, totalAmount: total_amount, chargeId: charge_id })
            await cart.deleteOne({ customer: customerExist?._id })
            return res.status(OK).json({ status: true, message: 'Your order place succesfully!' })
        }
        catch (error) {
            console.log(error)
            return res.status(INTERNAL_SERVER_ERROR).json({ status: false, message: error.message })

        }

    }
}

module.exports = adminController