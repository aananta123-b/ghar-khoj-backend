const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    phone: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["tenant", "owner", "admin"], default: "tenant" },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    verificationToken: String,
    isVerified: { type: Boolean, default: false },
    status: { type: String, default: "pending" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    otp: String,
    otpExpires: Date,
    otpAttempts: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);