const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String
}, { timestamps: true });

module.exports = mongoose.model("Message", schema);