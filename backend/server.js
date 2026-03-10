// import express  from "express"
// import cors from 'cors'
// import { connectDB } from "./config/db.js"
// import userRouter from "./routes/userRoute.js"
// import foodRouter from "./routes/productRoute.js"
// import 'dotenv/config'
// import cartRouter from "./routes/cartRoute.js"
// import orderRouter from "./routes/orderRoute.js"

const express = require("express");
const cors = require('cors');
const connectDB = require("./config/db.js");
const userRouter = require("./routes/userRoute.js");
const foodRouter = require("./routes/productRoute.js");
require('dotenv/config');
const cartRouter = require("./routes/cartRoute.js");
const orderRouter = require("./routes/orderRoute.js");
const chatRouter = require("./routes/chatRoute.js");

// app config
const app = express()
const port = 4000

// middlewares
app.use(express.json())
app.use(cors())

// db connection
connectDB()

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/chat", chatRouter)

app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))