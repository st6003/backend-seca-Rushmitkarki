const router = require("express").Router();
const { authGuard } = require("../middleware/authGaurd");
const { createChat, getChats, createGroupChat, renameGroup, addToGroup, removeFromGroup, leaveFromGroup } = require("../controllers/chatController");

router.post("/create", authGuard, createChat);
router.get("/fetch", authGuard, getChats);
router.post("/group",authGuard,createGroupChat);
router.put("/rename",authGuard,renameGroup);
router.put("/groupadd",authGuard,addToGroup);
router.put("/groupremove",authGuard,removeFromGroup);
// leave from group
router.put("/groupleave", authGuard, leaveFromGroup);

module.exports = router;
