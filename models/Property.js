const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,

    propertyType: {
        type: String,
        enum: ["single", "shared", "2bhk", "3bhk", "office"]
    },

    description: String,

    // ✅ UPDATED LOCATION STRUCTURE
    location: {
        lat: Number,
        lng: Number
    },

    city: String,
    price: Number,

    propertyCondition: {
        type: String,
        enum: ["new", "good", "old"]
    },

    photos: [String],
    verificationId: String,

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    amenities: [String],
    status: { type: String, default: "pending" }
});

module.exports = mongoose.model("Property", propertySchema);