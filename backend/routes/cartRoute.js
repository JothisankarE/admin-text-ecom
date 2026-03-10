// import express from 'express';
// import { addToCart, getCart, removeFromCart } from '../controllers/cartController.js';
// import authMiddleware from '../middleware/auth.js';

const express = require('express');
const {addToCart, getCart, removeFromCart} = require('../controllers/cartController.js');
const authMiddleware = require('../middleware/auth.js');

const cartRouter = express.Router();

cartRouter.post("/get",authMiddleware,getCart);
cartRouter.post("/add",authMiddleware,addToCart);
cartRouter.post("/remove",authMiddleware,removeFromCart);

// export default cartRouter;

module.exports = cartRouter;