const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Booking", schema);