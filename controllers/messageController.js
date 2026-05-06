const Message = require("../models/Message");
const User = require("../models/User");

exports.sendMessage = async (req, res) => {
    try {
        const receiver = await User.findById(req.body.receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver not found." });
        }

        const message = await Message.create({
            sender: req.user.id,
            receiver: req.body.receiverId,
            message: req.body.message
        });

        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const { withUserId } = req.query;
        if (!withUserId) {
            return res.status(400).json({ message: "withUserId query parameter is required." });
        }

        const conversation = await Message.find({
            $or: [
                { sender: req.user.id, receiver: withUserId },
                { sender: withUserId, receiver: req.user.id }
            ]
        })
            .sort({ createdAt: 1 })
            .populate("sender", "name email")
            .populate("receiver", "name email");

        res.json(conversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
