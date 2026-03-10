// import jwt from 'jsonwebtoken';

const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel.js');

const authMiddleware = async (req, res, next) => {
    // accept token from `token` header or `Authorization: Bearer <token>`
    let token = req.headers.token;
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
    }

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized. Login again.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // reject tokens issued before lastLogout
        const user = await userModel.findById(decoded.id).select('lastLogout');
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.lastLogout) {
            const tokenIatMs = decoded.iat * 1000; // iat is in seconds
            if (tokenIatMs <= new Date(user.lastLogout).getTime()) {
                return res.json({ success: false, message: 'Token expired. Please login again.' });
            }
        }

        req.body.userId = decoded.id;
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// export default authMiddleware;

module.exports = authMiddleware;