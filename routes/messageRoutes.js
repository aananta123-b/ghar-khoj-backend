const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { messageSchema } = require("../middleware/validation");
const { sendMessage, getConversation } = require("../controllers/messageController");

router.post("/", auth, validate(messageSchema), sendMessage);
router.get("/conversations", auth, getConversation);

module.exports = router;
