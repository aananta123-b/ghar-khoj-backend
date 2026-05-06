const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string().min(2).required(),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.pattern.base": "Phone must be 10 digits"
        }),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("tenant", "owner").required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
    password: Joi.string().min(6).required()
});

const sendOTPSchema = Joi.object({
    email: Joi.string().email().required()
});

const verifyOTPSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required()
});

const propertySchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            "string.pattern.base": "Phone must be 10 digits"
        }),
    email: Joi.string().email().required(),
    propertyType: Joi.string().required(),
    description: Joi.string().min(10).required(),
    location: Joi.string().required(),
    city: Joi.string().required(),
    price: Joi.number().min(0).required(),
    propertyCondition: Joi.string().required(),
    amenities: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ).optional()
});

const propertyUpdateSchema = Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .optional()
        .messages({
            "string.pattern.base": "Phone must be 10 digits"
        }),
    email: Joi.string().email().optional(),
    propertyType: Joi.string().optional(),
    description: Joi.string().min(10).optional(),
    location: Joi.string().optional(),
    city: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    propertyCondition: Joi.string().optional(),
    amenities: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ).optional()
}).min(1);

const profileUpdateSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    email: Joi.string().email().optional()
}).min(1);

const passwordChangeSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

const favoriteSchema = Joi.object({
    propertyId: Joi.string().required()
});

const bookingSchema = Joi.object({
    propertyId: Joi.string().required()
});

const reviewSchema = Joi.object({
    propertyId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().min(3).optional()
});

const reviewUpdateSchema = Joi.object({
    rating: Joi.number().min(1).max(5).optional(),
    comment: Joi.string().min(3).optional()
}).min(1);

const messageSchema = Joi.object({
    receiverId: Joi.string().required(),
    message: Joi.string().min(1).required()
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    sendOTPSchema,
    verifyOTPSchema,
    propertySchema,
    propertyUpdateSchema,
    profileUpdateSchema,
    passwordChangeSchema,
    favoriteSchema,
    bookingSchema,
    reviewSchema,
    reviewUpdateSchema,
    messageSchema
};