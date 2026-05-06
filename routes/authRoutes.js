const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    sendOTPSchema,
    verifyOTPSchema
} = require("../middleware/validation");
const {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    sendOTP,
    verifyOTP
} = require("../controllers/authController");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/verify/:token", verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset/:token", validate(resetPasswordSchema), resetPassword);
router.post("/send-otp", validate(sendOTPSchema), sendOTP);
router.post("/verify-otp", validate(verifyOTPSchema), verifyOTP);

module.exports = router;
