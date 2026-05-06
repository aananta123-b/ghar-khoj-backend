const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    approveProperty,
    rejectProperty,
    deleteProperty,
    approveUser,
    getPendingProperties,
    getAllUsers
} = require("../controllers/adminController");

router.put("/approve/:id", auth, authorize("admin"), approveProperty);
router.put("/reject/:id", auth, authorize("admin"), rejectProperty);
router.delete("/:id", auth, authorize("admin"), deleteProperty);
router.put("/approve-user/:id", auth, authorize("admin"), approveUser);
router.get("/pending-properties", auth, authorize("admin"), getPendingProperties);
router.get("/users", auth, authorize("admin"), getAllUsers);

module.exports = router;