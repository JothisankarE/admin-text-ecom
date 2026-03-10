// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     cartData:{type:Object,default:{}}
// }, { minimize: false })

// const userModel = mongoose.models.user || mongoose.model("user", userSchema);




// module.exports = userModel;


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },         // null for Google-auth users
    googleId: { type: String, default: null },          // Google OAuth UID
    googleAvatar: { type: String, default: "" },        // Google profile picture
    isActive: { type: Boolean, default: false },
    confirmationToken: { type: String },
    cartData: { type: Object, default: {} },
    address: { type: String, default: "" },
    theme: { type: String, default: "light" },
    image: { type: String, default: "" },
    lastLogin: { type: Date, default: null },
    lastLogout: { type: Date, default: null },
    suspendedUntil: { type: Date, default: null }
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model("user", userSchema);




module.exports = userModel;