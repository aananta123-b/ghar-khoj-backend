const Booking = require("../models/Booking");
const Property = require("../models/Property");

exports.createBooking = async (req, res) => {
    try {
        if (req.user.role !== "tenant") {
            return res.status(403).json({ message: "Only tenants can request a booking." });
        }

        const property = await Property.findById(req.body.propertyId);
        if (!property || property.status !== "approved") {
            return res.status(404).json({ message: "Property not found or not available." });
        }

        const booking = await Booking.create({
            property: property._id,
            tenant: req.user.id,
            owner: property.owner,
            status: "pending"
        });

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            $or: [{ tenant: req.user.id }, { owner: req.user.id }]
        })
            .populate("property")
            .populate("tenant", "name email phone")
            .populate("owner", "name email phone");

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        if (req.user.role !== "admin" && booking.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the owner or admin can approve bookings." });
        }

        booking.status = "approved";
        await booking.save();

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rejectBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        if (req.user.role !== "admin" && booking.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the owner or admin can reject bookings." });
        }

        booking.status = "rejected";
        await booking.save();

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        if (req.user.role !== "admin" && booking.tenant.toString() !== req.user.id) {
            return res.status(403).json({ message: "Only the tenant or admin can cancel this booking." });
        }

        await booking.deleteOne();
        res.json({ message: "Booking canceled." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
