const Property = require("../models/Property");
const User = require("../models/User");
const axios = require("axios");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "ghar-khoj" },
            (error, result) => {
                if (result) resolve(result.secure_url);
                else reject(error);
            }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

const normalizeAmenities = (amenities) => {
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities.map((item) => item.toString().trim()).filter(Boolean);
    return amenities
        .toString()
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const geocodeLocation = async (location) => {
    const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${process.env.GEOCODE_API_KEY}`
    );

    if (!response.data.results.length) {
        throw new Error("Invalid location");
    }

    return response.data.results[0].geometry;
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

exports.createProperty = async (req, res) => {
    try {
        if (req.user.role !== "owner") {
            return res.status(403).json({ message: "Only owners can add property." });
        }

        const { lat, lng } = await geocodeLocation(req.body.location);

        const photos = req.files?.photos
            ? await Promise.all(req.files.photos.map((file) => uploadToCloudinary(file)))
            : [];

        const verificationId = req.files?.verificationId
            ? await uploadToCloudinary(req.files.verificationId[0])
            : null;

        const property = await Property.create({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            propertyType: req.body.propertyType,
            description: req.body.description,
            location: { lat, lng },
            city: req.body.city,
            price: req.body.price,
            propertyCondition: req.body.propertyCondition,
            amenities: normalizeAmenities(req.body.amenities),
            photos,
            verificationId,
            owner: req.user.id
        });

        res.json(property);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProperties = async (req, res) => {
    try {
        const { page = 1, limit = 10, city, minPrice, maxPrice } = req.query;

        const filter = { status: "approved" };
        if (city) filter.city = { $regex: city, $options: "i" };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const properties = await Property.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json(properties);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate("owner", "name email phone");
        if (!property) {
            return res.status(404).json({ message: "Property not found." });
        }

        if (property.status !== "approved") {
            if (!req.user || (req.user.role !== "admin" && property.owner.toString() !== req.user.id)) {
                return res.status(404).json({ message: "Property not found." });
            }
        }

        res.json(property);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found." });
        }

        if (req.user.role !== "admin" && property.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only property owner or admin can update this property." });
        }

        if (req.body.location) {
            const { lat, lng } = await geocodeLocation(req.body.location);
            property.location = { lat, lng };
        }

        if (req.body.name) property.name = req.body.name;
        if (req.body.phone) property.phone = req.body.phone;
        if (req.body.email) property.email = req.body.email;
        if (req.body.propertyType) property.propertyType = req.body.propertyType;
        if (req.body.description) property.description = req.body.description;
        if (req.body.city) property.city = req.body.city;
        if (req.body.price) property.price = req.body.price;
        if (req.body.propertyCondition) property.propertyCondition = req.body.propertyCondition;
        if (req.body.amenities) property.amenities = normalizeAmenities(req.body.amenities);

        if (req.files?.photos) {
            const uploadedPhotos = await Promise.all(req.files.photos.map((file) => uploadToCloudinary(file)));
            property.photos = [...property.photos, ...uploadedPhotos];
        }

        if (req.files?.verificationId) {
            property.verificationId = await uploadToCloudinary(req.files.verificationId[0]);
        }

        if (req.user.role !== "admin" && property.status === "approved") {
            property.status = "pending";
        }

        await property.save();
        res.json(property);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found." });
        }

        if (req.user.role !== "admin" && property.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only property owner or admin can delete this property." });
        }

        await property.deleteOne();
        res.json({ message: "Property deleted." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getNearbyProperties = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        const properties = await Property.find({ status: "approved" });

        const nearby = properties.filter((p) => {
            if (!p.location) return false;

            const dist = haversineDistance(
                Number(lat),
                Number(lng),
                p.location.lat,
                p.location.lng
            );

            return dist <= 5;
        });

        res.json(nearby);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.collaborativeFilter = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        const similarUsers = await User.find({
            favorites: { $in: currentUser.favorites },
            _id: { $ne: currentUser._id }
        });

        let recommendedIds = [];
        similarUsers.forEach((user) => {
            recommendedIds.push(...user.favorites);
        });

        recommendedIds = [...new Set(recommendedIds)];

        const properties = await Property.find({
            _id: { $in: recommendedIds },
            status: "approved"
        });

        res.json(properties);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.contentBasedFilter = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        const similar = await Property.find({
            _id: { $ne: property._id },
            status: "approved",
            $or: [
                { propertyType: property.propertyType },
                { city: property.city },
                {
                    price: {
                        $gte: property.price - 2000,
                        $lte: property.price + 2000
                    }
                }
            ]
        }).limit(5);

        res.json(similar);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
