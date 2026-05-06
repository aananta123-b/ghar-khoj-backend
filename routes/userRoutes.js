const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
    profileUpdateSchema,
    passwordChangeSchema,
    favoriteSchema
} = require("../middleware/validation");
const {
    getProfile,
    updateProfile,
    changePassword,
    getFavorites,
    getMyProperties,
    addFavorite,
    removeFavorite
} = require("../controllers/userController");

router.get("/profile", auth, getProfile);
router.put("/profile", auth, validate(profileUpdateSchema), updateProfile);
router.put("/password", auth, validate(passwordChangeSchema), changePassword);
router.get("/favorites", auth, getFavorites);
router.get("/my-properties", auth, getMyProperties);
router.post("/favorite", auth, validate(favoriteSchema), addFavorite);
router.post("/unfavorite", auth, validate(favoriteSchema), removeFavorite);

module.exports = router;