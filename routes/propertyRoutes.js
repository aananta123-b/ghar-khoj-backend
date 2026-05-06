const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const { propertySchema, propertyUpdateSchema } = require("../middleware/validation");

const {
    createProperty,
    getProperties,
    getNearbyProperties,
    collaborativeFilter,
    contentBasedFilter,
    getPropertyById,
    updateProperty,
    deleteProperty
} = require("../controllers/propertyController");

// ================== 🏠 CREATE PROPERTY ==================
router.post(
    "/",
    auth,
    upload.fields([
        { name: "photos", maxCount: 5 },
        { name: "verificationId", maxCount: 1 }
    ]),
    validate(propertySchema),
    createProperty
);

// ================== 🔍 SEARCH + PAGINATION ==================
router.get("/", getProperties);

// ================== 📍 HAVERSINE ==================
router.get("/nearby", getNearbyProperties);

// ================== 🤝 COLLABORATIVE ==================
router.get("/collaborative", auth, collaborativeFilter);

// ================== 📊 CONTENT BASED ==================
router.get("/similar/:id", contentBasedFilter);

// ================== 📌 PROPERTY DETAIL ==================
router.get("/:id", getPropertyById);

router.put(
    "/:id",
    auth,
    upload.fields([
        { name: "photos", maxCount: 5 },
        { name: "verificationId", maxCount: 1 }
    ]),
    validate(propertyUpdateSchema),
    updateProperty
);

router.delete("/:id", auth, deleteProperty);

module.exports = router;