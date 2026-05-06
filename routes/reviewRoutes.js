const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { reviewSchema, reviewUpdateSchema } = require("../middleware/validation");
const {
    addReview,
    getReviewsByProperty,
    updateReview,
    deleteReview
} = require("../controllers/reviewController");

router.post("/", auth, validate(reviewSchema), addReview);
router.get("/property/:propertyId", getReviewsByProperty);
router.put("/:id", auth, validate(reviewUpdateSchema), updateReview);
router.delete("/:id", auth, deleteReview);

module.exports = router;
