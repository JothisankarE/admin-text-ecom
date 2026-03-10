/**
 * One-time script: Remove duplicate orders from MongoDB.
 * Keeps the FIRST (oldest) order for each userId+amount+date-minute group.
 * Run once: node scripts/removeDuplicateOrders.js
 */

require('dotenv/config');
const mongoose = require('mongoose');
const orderModel = require('../models/orderModel');

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const allOrders = await orderModel.find({ isDeleted: { $ne: true } }).sort({ date: 1 });
    console.log(`Total active orders found: ${allOrders.length}`);

    // Group by userId + amount + item-count + minute-bucket
    const seen = new Map();
    const toDelete = [];

    for (const order of allOrders) {
        // Key: userId + amount + number of items + minute (rounded to nearest minute)
        const minute = new Date(order.date).setSeconds(0, 0);
        const key = `${order.userId}__${order.amount}__${order.items.length}__${minute}`;

        if (seen.has(key)) {
            toDelete.push(order._id);
            console.log(`  🗑️  Duplicate: ${order._id} (keeping ${seen.get(key)})`);
        } else {
            seen.set(key, order._id);
        }
    }

    if (toDelete.length === 0) {
        console.log('✅ No duplicates found. Database is clean.');
    } else {
        await orderModel.deleteMany({ _id: { $in: toDelete } });
        console.log(`✅ Removed ${toDelete.length} duplicate order(s).`);
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
};

run().catch(err => {
    console.error('Script error:', err);
    process.exit(1);
});
