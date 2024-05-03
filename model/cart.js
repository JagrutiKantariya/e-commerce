const mongoose = require('mongoose');
const { Schema } = mongoose;
const cartItemSchema = require('./cartItem');

// const cartItemSchema = new mongoose.Schema({
//     product: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
//     quantity: { type: Number, required: true },
//     price: { type: Number, required: true }
// });
const cartSchema = new Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'customers', required: true },
    items: [cartItemSchema],
    createdAt: { type: Date, default: Date.now }
});

const cart = mongoose.model('carts', cartSchema);

module.exports = cart;