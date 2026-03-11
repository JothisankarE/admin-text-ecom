const chatModel = require("../models/chatModel.js");
const userModel = require("../models/userModel.js");
const { sendContactFormEmail } = require("../utlis/sendEmail.js");

// Save a new message or update existing chat
const saveMessage = async (req, res) => {
    const { userId, text, sender, userName, orderId, issueType, firstName, lastName, email, phone, countryCode, services, rating } = req.body;

    try {
        // specific logic: Find an active (pending) chat for this user, or create a new one
        let chat = await chatModel.findOne({ userId: userId }).sort({ createdAt: -1 });

        // If no chat exists or the last one is resolved, create a new one
        if (!chat || chat.status === 'Resolved') {
            chat = new chatModel({
                userId: userId,
                userName: userName || `${firstName} ${lastName}` || "User",
                messages: [],
                status: 'Pending'
            });
        }

        chat.messages.push({
            sender: sender,
            text: text
        });

        // Update context if provided
        if (orderId) chat.orderId = orderId;
        if (issueType) chat.issueType = issueType;

        chat.lastUpdated = Date.now();
        await chat.save();

        // If this is a direct contact form submission (has firstName/email), send email notification
        if (firstName && email) {
            try {
                await sendContactFormEmail({
                    firstName,
                    lastName,
                    email,
                    phone,
                    countryCode,
                    services,
                    message: text,
                    rating
                });
                console.log("Contact form email sent successfully");
            } catch (mailError) {
                console.log("Failed to send contact form email:", mailError);
                // We don't fail the response if email fails, but it's logged
            }
        }

        res.json({ success: true, message: "Message saved", chatId: chat._id });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error saving message" });
    }
}

// Fetch all chats for Admin
const listChats = async (req, res) => {
    try {
        const chats = await chatModel.find({}).sort({ lastUpdated: -1 });
        res.json({ success: true, data: chats });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching chats" });
    }
}

// Get specific user chat
const getUserChat = async (req, res) => {
    const { userId } = req.body;
    try {
        const chats = await chatModel.findOne({ userId: userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: chats });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching user chat" });
    }
}

// Get all tickets/chats for a user
const getUserTickets = async (req, res) => {
    const { userId } = req.body;
    try {
        const tickets = await chatModel.find({ userId: userId }).sort({ lastUpdated: -1 });
        res.json({ success: true, data: tickets });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching user tickets" });
    }
}

// Admin resolves a chat
const updateChatStatus = async (req, res) => {
    const { chatId, status } = req.body;
    try {
        await chatModel.findByIdAndUpdate(chatId, { status: status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating status" });
    }
}

// Admin sends a reply
const adminReply = async (req, res) => {
    const { chatId, text } = req.body;
    try {
        const chat = await chatModel.findById(chatId);
        if (chat) {
            chat.messages.push({
                sender: 'admin',
                text: text
            });
            chat.lastUpdated = Date.now();
            // Optionally set status to Pending/Active if it was resolved? 
            // For now let's just add the message.
            await chat.save();
            res.json({ success: true, message: "Reply sent" });
        } else {
            res.json({ success: false, message: "Chat not found" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error sending reply" });
    }
}

module.exports = {
    saveMessage,
    listChats,
    updateChatStatus,
    adminReply,
    getUserChat,
    getUserTickets
}
