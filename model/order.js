const mongoose = require('mongoose');
const { Schema } = mongoose;
const cartItemSchema = require('./cartItem');

const orderSchema = new Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'customers', required: true },
    items: [cartItemSchema],
    totalAmount: { type: Number, required: true },
    chargeId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('orders', orderSchema);

module.exports = Order;