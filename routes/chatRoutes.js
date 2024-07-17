const router = require("express").Router();
const { authGuard } = require("../middleware/authGaurd");
const { createChat, getChats, createGroupChat, renameGroup } = require("../controllers/chatController");

router.post("/create", authGuard, createChat);
router.get("/fetch", authGuard, getChats);
router.post("/group",authGuard,createGroupChat);
router.put("/rename",authGuard,renameGroup);
// router.put("/groupremove",authGuard,removeFromGroup);
// router.put("/groupadd",authGuard,addToGroup);

module.exports = router;
