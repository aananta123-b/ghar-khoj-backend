const Review = require("../models/Review");
const Property = require("../models/Property");

exports.addReview = async (req, res) => {
    try {
        const property = await Property.findById(req.body.propertyId);
        if (!property || property.status !== "approved") {
            return res.status(404).json({ message: "Property not found or not approved." });
        }

        const existingReview = await Review.findOne({
            property: req.body.propertyId,
            user: req.user.id
        });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this property." });
        }

        const review = await Review.create({
            property: req.body.propertyId,
            user: req.user.id,
            rating: req.body.rating,
            comment: req.body.comment
        });

        res.json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReviewsByProperty = async (req, res) => {
    try {
        const reviews = await Review.find({ property: req.params.propertyId })
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }

        if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Only the author or admin can update this review." });
        }

        if (req.body.rating !== undefined) review.rating = req.body.rating;
        if (req.body.comment !== undefined) review.comment = req.body.comment;

        await review.save();
        res.json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }

        if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Only the author or admin can delete this review." });
        }

        await review.deleteOne();
        res.json({ message: "Review deleted." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
