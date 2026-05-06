const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { bookingSchema } = require("../middleware/validation");
const {
    createBooking,
    getMyBookings,
    approveBooking,
    rejectBooking,
    cancelBooking
} = require("../controllers/bookingController");

router.post("/", auth, validate(bookingSchema), createBooking);
router.get("/me", auth, getMyBookings);
router.put("/:id/approve", auth, approveBooking);
router.put("/:id/reject", auth, rejectBooking);
router.delete("/:id", auth, cancelBooking);

module.exports = router;
