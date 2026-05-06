const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const User = require("./models/User");
const Message = require("./models/Message");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

// ✅ AUTO CREATE ADMIN
const createAdmin = async () => {
    try {
        const admin = await User.findOne({
            email: "basnetmichael22@gmail.com"
        });

        if (!admin) {
            const hashed = await bcrypt.hash("Basnet@123", 10);

            await User.create({
                name: "Admin",
                phone: "9800000000",
                email: "basnetmichael22@gmail.com",
                password: hashed,
                role: "admin"
            });

            console.log("Admin created");
        }
    } catch (err) {
        console.log(err);
    }
};

createAdmin();

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

io.on("connection", (socket) => {
    socket.on("join", (userId) => {
        if (userId) {
            socket.join(userId);
        }
    });

    socket.on("send_message", async (data) => {
        try {
            if (!data.senderId || !data.receiverId || !data.message) return;

            const record = await Message.create({
                sender: data.senderId,
                receiver: data.receiverId,
                message: data.message
            });

            io.to(data.receiverId).emit("receive_message", record);
        } catch (err) {
            console.error("Socket message error:", err.message);
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);