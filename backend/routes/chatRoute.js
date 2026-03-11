const express = require('express');
const { saveMessage, listChats, updateChatStatus, adminReply, getUserChat, getUserTickets } = require('../controllers/chatController.js');
const authMiddleware = require('../middleware/auth.js'); // Assuming you want auth for user actions

const chatRouter = express.Router();

// Public/User routes
chatRouter.post("/save", authMiddleware, saveMessage);
chatRouter.post("/userchat", authMiddleware, getUserChat);
chatRouter.post("/usertickets", authMiddleware, getUserTickets);

// Admin routes (Ideally should have admin middleware protection)
chatRouter.get("/list", listChats);
chatRouter.post("/status", updateChatStatus);
chatRouter.post("/reply", adminReply);

module.exports = chatRouter;
