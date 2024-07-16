const router = require("express").Router();
const { authGuard } = require("../middleware/authGaurd");
const { createChat, getChats } = require("../controllers/chatController");

router.post("/create", authGuard, createChat);
router.get("/:userId", authGuard, getChats);

module.exports = router;
