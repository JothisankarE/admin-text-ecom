// import express from 'express';
// import authMiddleware from '../middleware/auth.js';
// import { listOrders, placeOrder,updateStatus,userOrders, verifyOrder } from '../controllers/orderController.js';

const express = require('express');
const authMiddleware = require('../middleware/auth.js');
const { listOrders, placeOrder, updateStatus, userOrders, verifyOrder, getDashboardStats, generateInvoice, softDeleteOrder, listDeletedOrders, permanentDeleteOrder } = require('../controllers/orderController.js');

const orderRouter = express.Router();

orderRouter.get("/list", listOrders);
orderRouter.get("/stats", getDashboardStats);
orderRouter.get("/deleted", listDeletedOrders);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/status", updateStatus);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/receipt", generateInvoice);
orderRouter.post("/delete", softDeleteOrder);
orderRouter.post("/permanent-delete", permanentDeleteOrder);

module.exports = orderRouter;