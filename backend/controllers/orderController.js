const orderModel = require("../models/orderModel.js");
const userModel = require("../models/userModel.js");
const productModel = require("../models/productModel.js");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { sendOrderConfirmationEmail } = require('../utlis/sendEmail');


// Placing User Order for Frontend
// const placeOrder = async (req, res) => {
//      try {
//          const newOrder = new orderModel({
//              userId: req.body.userId,
//              items: req.body.items,
//              amount: req.body.amount,
//             address: req.body.address,
//         })
//          await newOrder.save();
//          await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

//          const line_items = req.body.items.map((item) => ({
//              price_data: {
//               currency: "inr",
//               product_data: {
//                 name: item.name
//               },
//               unit_amount: item.price*100*80
//             },
//             quantity: item.quantity
//           }))

//         line_items.push({
//             price_data:{
//                 currency:"inr",
//                 product_data:{
//                     name:"Delivery Charge"
//                 },
//                 unit_amount: 5*80*100
//             },
//             quantity:1
//         })


//           const session = await stripe.checkout.sessions.create({
//             success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?success=true&orderId=${newOrder._id}`,
//             cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?success=false&orderId=${newOrder._id}`,
//             line_items: line_items,
//             mode: 'payment',
//           });

//           res.json({success:true,session_url:session.url});

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: "Error" })
//     }
// }



const placeOrder = async (req, res) => {
  try {
    const { paymentMethod, upiId } = req.body;

    // ── Backend duplicate guard ──
    // Reject if the same user placed an order with the same amount within the last 60 seconds
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    const recentDuplicate = await orderModel.findOne({
      userId: req.body.userId,
      amount: req.body.amount,
      isDeleted: { $ne: true },
      date: { $gte: sixtySecondsAgo }
    });

    if (recentDuplicate) {
      console.warn(`Duplicate order blocked for userId ${req.body.userId}, orderId ${recentDuplicate._id}`);
      return res.json({
        success: false,
        message: 'Duplicate order detected. Your previous order was already placed successfully.',
        orderId: recentDuplicate._id
      });
    }

    // Create the new order document
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      paymentMethod: paymentMethod || 'stripe',
      upiId: upiId || '',
      payment: false,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });


    // Handle different payment methods
    if (paymentMethod === 'cod') {
      // Cash on Delivery - Order placed successfully, send confirmation email after 30 seconds
      setTimeout(() => { sendOrderConfirmationEmail(newOrder); }, 30000);
      res.json({
        success: true,
        message: 'Order placed successfully! Payment will be collected on delivery.',
        orderId: newOrder._id
      });
    } else if (paymentMethod === 'upi') {
      // UPI Payment - Order placed, UPI ID saved for verification, email sent after verify
      res.json({
        success: true,
        message: 'Order placed successfully! Please complete payment using UPI.',
        orderId: newOrder._id,
        upiId: upiId
      });
    } else {
      // Stripe Payment - Create checkout session
      const line_items = req.body.items.map((item) => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      }));

      line_items.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Delivery Charge',
          },
          unit_amount: 50 * 100, // INR 50.00 - Stripe has a minimum amount (~₹40)
        },
        quantity: 1,
      });

      // Create the Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?success=false&orderId=${newOrder._id}`,
        line_items: line_items,
        mode: 'payment',
        customer_email: req.body.address.email,
        shipping_address_collection: {
          allowed_countries: ['IN'],
        },
      });

      res.json({ success: true, session_url: session.url });
    }
  } catch (error) {
    console.error("❌ Order placement error:", {
      message: error.message,
      stack: error.stack,
      paymentMethod: req.body.paymentMethod,
      amount: req.body.amount
    });
    res.json({ success: false, message: error.message || 'Error' });
  }
};











// Listing Orders for Admin panel (exclude soft-deleted)
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ isDeleted: { $ne: true } });
    res.json({ success: true, data: orders })
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" })
  }
}

// Soft-delete a Delivered order (admin only)
const softDeleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.json({ success: false, message: "orderId is required" });

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found" });

    // Case-insensitive check
    if (order.status.toLowerCase() !== 'delivered') {
      return res.json({ success: false, message: "Only Delivered orders can be deleted" });
    }

    const updated = await orderModel.findByIdAndUpdate(
      orderId,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, message: "Failed to update order" });
    }

    console.log(`Order ${orderId} soft-deleted at ${updated.deletedAt}`);
    res.json({ success: true, message: "Order moved to deleted list" });
  } catch (error) {
    console.error("softDeleteOrder error:", error);
    res.json({ success: false, message: "Server error: " + error.message });
  }
};

// List all soft-deleted orders
const listDeletedOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching deleted orders" });
  }
};

// User Orders for Frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.body.userId, isDeleted: { $ne: true } })
      .sort({ date: -1 });

    // Deduplicate by _id (safety net against any DB-level duplicates)
    const seen = new Set();
    const uniqueOrders = orders.filter(order => {
      const id = order._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    res.json({ success: true, data: uniqueOrders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
}

const updateStatus = async (req, res) => {
  console.log(req.body);
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Status Updated" })
  } catch (error) {
    res.json({ success: false, message: "Error" })
  }

}

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { payment: true }, { new: true });
      // Send confirmation email 30 seconds after successful payment verification (Stripe & UPI)
      if (updatedOrder) {
        setTimeout(() => { sendOrderConfirmationEmail(updatedOrder); }, 30000);
      }
      res.json({ success: true, message: "Paid" })
    }
    else {
      await orderModel.findByIdAndDelete(orderId)
      res.json({ success: false, message: "Not Paid" })
    }
  } catch (error) {
    res.json({ success: false, message: "Not  Verified" })
  }

}

const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await productModel.countDocuments({});
    const totalOrders = await orderModel.countDocuments({});
    const totalUsers = await userModel.countDocuments({});

    const revenueResult = await orderModel.aggregate([
      { $match: { payment: true } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      data: {
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue.toLocaleString('en-IN'),
        users: totalUsers
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching dashboard stats" });
  }
}



const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const PDFDocument = require('pdfkit');
    const path = require('path');
    const fs = require('fs');
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);

    doc.pipe(res);

    const logoPath = path.join(__dirname, '../assets/mat_logo.png');

    // Design Colors
    const primaryColor = '#e74c3c'; // Red
    const textColor = '#333333';
    const lightBg = '#f9f9f9';
    const successBg = '#dff0d8';
    const successText = '#3c763d';

    // Top Red Bar
    doc.rect(50, 45, 510, 15).fill(primaryColor);

    // Header Title
    doc.fillColor(textColor)
      .fontSize(30)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 80);

    // Date and ID on the right
    doc.fontSize(10)
      .font('Helvetica')
      .text(`DATE: ${new Date(order.date).toLocaleDateString()}`, 400, 85, { align: 'right' });
    doc.text(`INVOICE NO: ${order._id.toString().slice(-6).toUpperCase()}`, 400, 100, { align: 'right' });

    // Logo if exists
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 470, 120, { width: 80 });
    }

    // Company Info
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor(textColor)
      .text('MAT Traders', 50, 130)
      .text('123 Textile Avenue', 50, 145)
      .text('Salai Road, Trichy - 620001', 50, 160)
      .text('Phone: +91 98765 43210', 50, 175)
      .text('Email: support@mat.com', 50, 190);

    doc.moveDown(2);

    // Bill To & Ship To
    const topY = 230;
    const billToX = 50;
    const shipToX = 300;

    doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor).text('BILL TO', billToX, topY);
    doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor).text('SHIP TO', shipToX, topY);

    doc.fillColor(textColor).font('Helvetica').fontSize(10);
    // Bill To Content
    doc.text(`${order.address.firstName} ${order.address.lastName}`, billToX, topY + 20);
    doc.text(`${order.address.street}`, billToX, topY + 35);
    doc.text(`${order.address.city}, ${order.address.state} - ${order.address.zipcode}`, billToX, topY + 50);
    doc.text(`Phone: ${order.address.phone}`, billToX, topY + 65);

    // Ship To Content
    doc.text(`${order.address.firstName} ${order.address.lastName}`, shipToX, topY + 20);
    doc.text(`${order.address.street}`, shipToX, topY + 35);
    doc.text(`${order.address.city}, ${order.address.state} - ${order.address.zipcode}`, shipToX, topY + 50);
    doc.text(`Phone: ${order.address.phone}`, shipToX, topY + 65);

    doc.moveDown(4);

    // Table Header
    const tableTop = 350;
    doc.rect(50, tableTop, 510, 20).fill(primaryColor);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
    doc.text('DESCRIPTION', 60, tableTop + 5);
    doc.text('QTY', 350, tableTop + 5, { width: 50, align: 'center' });
    doc.text('UNIT PRICE', 410, tableTop + 5, { width: 70, align: 'center' });
    doc.text('TOTAL', 490, tableTop + 5, { width: 60, align: 'right' });

    // Table Items
    let currentY = tableTop + 25;
    doc.fillColor(textColor).font('Helvetica');

    order.items.forEach((item, index) => {
      if (index % 2 === 1) {
        doc.rect(50, currentY - 2, 510, 18).fill(lightBg);
        doc.fillColor(textColor);
      }

      doc.text(item.name, 60, currentY);
      doc.text(item.quantity.toString(), 350, currentY, { width: 50, align: 'center' });
      doc.text(`₹${item.price}`, 410, currentY, { width: 70, align: 'center' });
      doc.text(`₹${item.price * item.quantity}`, 490, currentY, { width: 60, align: 'right' });

      currentY += 20;
    });

    // Summary Section
    currentY += 20;
    const summaryX = 350;
    const deliveryCharge = 5;
    const subtotal = order.amount - deliveryCharge;

    doc.font('Helvetica').fontSize(10);

    // Subtotal
    doc.text('SUBTOTAL', summaryX, currentY);
    doc.text(`₹${subtotal}`, 480, currentY, { width: 70, align: 'right' });
    currentY += 15;

    // Discount (Placeholder)
    doc.text('DISCOUNT', summaryX, currentY);
    doc.text(`₹0.00`, 480, currentY, { width: 70, align: 'right' });
    currentY += 15;

    // Tax
    doc.text('TAX RATE (0%)', summaryX, currentY);
    doc.text(`₹0.00`, 480, currentY, { width: 70, align: 'right' });
    currentY += 15;

    // Shipping
    doc.text('SHIPPING/HANDLING', summaryX, currentY);
    doc.text(`₹${deliveryCharge}.00`, 480, currentY, { width: 70, align: 'right' });
    currentY += 25;

    // Balance Due
    doc.rect(summaryX - 10, currentY - 5, 220, 25).fill(successBg);
    doc.fillColor(successText).font('Helvetica-Bold').fontSize(12);
    doc.text('BALANCE DUE', summaryX, currentY);
    doc.text(`₹${order.amount}.00`, 480, currentY, { width: 70, align: 'right' });

    // Footer
    doc.fillColor(textColor)
      .font('Helvetica-Oblique')
      .fontSize(10)
      .text('Thank you for your business!', 50, 700, { align: 'center' });

    // Bottom Red Bar
    doc.rect(50, 750, 510, 15).fill(primaryColor);

    doc.end();

  } catch (error) {
    console.log("Error generating invoice:", error);
    res.status(500).json({ success: false, message: "Error generating invoice" });
  }
}

// Permanently delete an already soft-deleted order from MongoDB
const permanentDeleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.json({ success: false, message: 'orderId is required' });

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: 'Order not found' });
    if (!order.isDeleted) {
      return res.json({ success: false, message: 'Only archived (deleted) orders can be permanently removed' });
    }

    await orderModel.findByIdAndDelete(orderId);
    console.log(`Order ${orderId} permanently deleted by admin.`);
    res.json({ success: true, message: 'Order permanently deleted' });
  } catch (error) {
    console.error('permanentDeleteOrder error:', error);
    res.json({ success: false, message: 'Server error: ' + error.message });
  }
};

module.exports = {
  placeOrder,
  listOrders,
  userOrders,
  updateStatus,
  verifyOrder,
  getDashboardStats,
  generateInvoice,
  softDeleteOrder,
  listDeletedOrders,
  permanentDeleteOrder
};