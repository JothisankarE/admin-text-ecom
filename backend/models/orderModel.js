

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Processing" },
    date: { type: Date, default: Date.now() },
    payment: { type: Boolean, default: false },
    paymentMethod: { type: String, default: "stripe" }, // stripe, cod, upi
    upiId: { type: String, default: "" },              // Store UPI ID when payment method is UPI
    isDeleted: { type: Boolean, default: false },       // soft-delete flag
    deletedAt: { type: Date, default: null }            // when it was deleted
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);



module.exports = orderModel;