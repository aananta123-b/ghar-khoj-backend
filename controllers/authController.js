const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mailer = require("../config/email");

// 🔐 REGISTER WITH EMAIL VERIFICATION
exports.register = async (req, res) => {
    try {
        const { name, phone, email, password, role } = req.body;

        // ❌ Block admin registration
        if (role === "admin") {
            return res.status(403).json({ message: "Admin cannot be registered" });
        }

        // ❌ Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 🔒 Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔑 Generate verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // 👤 Create user
        const user = await User.create({
            name,
            phone,
            email,
            password: hashedPassword,
            role,
            verificationToken,
            isVerified: false
        });

        // 📧 Send email
        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        const link = `${baseUrl}/api/auth/verify/${verificationToken}`;

        await mailer.sendMail({
            to: email,
            subject: "Verify Your Account",
            html: `<h3>Click below to verify your account:</h3>
                   <a href="${link}">Verify Account</a>`
        });

        res.json({
            message: "Registration successful. Please check your email to verify your account."
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// 📧 VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({
            verificationToken: req.params.token
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.isVerified = true;
        user.verificationToken = null;

        await user.save();

        res.json({ message: "Email verified successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// 🔑 LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ❌ Check email verified
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before login"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password" });
        }

        // 🎟️ Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) return res.status(404).json({ message: "User not found" });

        const token = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min

        await user.save();

        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        const link = `${baseUrl}/api/auth/reset/${token}`;

        await mailer.sendMail({
            to: user.email,
            subject: "Reset Password",
            html: `<a href="${link}">Reset Password</a>`
        });

        res.json({ message: "Reset link sent to email" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashed = await bcrypt.hash(req.body.password, 10);

        user.password = hashed;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.json({ message: "Password reset successful" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendOTP = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;

        user.otpAttempts = 0; // 🔥 reset attempts

        await user.save();

        await mailer.sendMail({
            to: user.email,
            subject: "Your OTP",
            html: `<h2>${otp}</h2>`
        });

        res.json({ message: "OTP sent" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        // ❌ Too many attempts
        if (user.otpAttempts >= 3) {
            return res.status(429).json({
                message: "Too many attempts. Request new OTP."
            });
        }

        // ❌ Wrong OTP
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            user.otpAttempts += 1;
            await user.save();

            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        // ✅ SUCCESS → reset attempts
        user.otp = null;
        user.otpExpires = null;
        user.otpAttempts = 0;

        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};