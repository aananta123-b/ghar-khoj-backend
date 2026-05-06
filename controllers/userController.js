const User = require("../models/User");
const Property = require("../models/Property");
const bcrypt = require("bcrypt");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -verificationToken -resetPasswordToken -resetPasswordExpires -otp -otpExpires -otpAttempts");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updates = {};
        const { name, phone, email } = req.body;

        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        if (email) updates.email = email;

        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true
        }).select("-password -verificationToken -resetPasswordToken -resetPasswordExpires -otp -otpExpires -otpAttempts");

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        user.password = await bcrypt.hash(req.body.newPassword, 10);
        await user.save();

        res.json({ message: "Password changed successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("favorites");
        res.json(user.favorites);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyProperties = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ message: "Only owners can view their properties." });
        }

        const properties = await Property.find({ owner: req.user.id });
        res.json(properties);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.favorites.includes(req.body.propertyId)) {
            user.favorites.push(req.body.propertyId);
            await user.save();
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeFavorite = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.favorites = user.favorites.filter(
            id => id.toString() !== req.body.propertyId
        );

        await user.save();

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};