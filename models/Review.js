const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: Number,
    comment: String
}, { timestamps: true });

module.exports = mongoose.model("Review", schema);