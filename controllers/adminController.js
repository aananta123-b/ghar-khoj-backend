const Property = require("../models/Property");
const User = require("../models/User");

exports.approveProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        property.status = "approved";
        await property.save();

        res.json(property);
    } catch (err) {
        res.status(400).json({ message: "Invalid Property ID" });
    }
};

exports.rejectProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        property.status = "rejected";
        await property.save();

        res.json(property);
    } catch (err) {
        res.status(400).json({ message: "Invalid Property ID" });
    }
};


exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        res.json({ message: "Property deleted" });
    } catch (err) {
        res.status(400).json({ message: "Invalid Property ID" });
    }
};


exports.approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.status = "approved";
        await user.save();

        res.json(user);
    } catch (err) {
        res.status(400).json({ message: "Invalid User ID" });
    }
};

exports.getPendingProperties = async (req, res) => {
    try {
        const properties = await Property.find({ status: "pending" }).populate("owner", "name email phone");
        res.json(properties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -verificationToken -resetPasswordToken -resetPasswordExpires -otp -otpExpires -otpAttempts");
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};