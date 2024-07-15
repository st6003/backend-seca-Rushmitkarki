const router = require('express').Router();
const { sendMessage, getMessages } = require('../controllers/messageController');

router.post('/send', sendMessage);
router.get('/messages/:userId/:chatUserId', getMessages);

module.exports = router;
