const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: { type: String, required: false }, // Can be null for guest users if we supported them, but usually we have users
    userName: { type: String, required: false },
    messages: [
        {
            sender: { type: String, enum: ['user', 'bot', 'admin'], required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Resolved', 'Closed'] },
    orderId: { type: String, required: false }, // Context: Linked Order ID
    issueType: { type: String, required: false }, // Context: Issue Category (e.g., Refund, Delivery)
    createdAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);

module.exports = chatModel;
