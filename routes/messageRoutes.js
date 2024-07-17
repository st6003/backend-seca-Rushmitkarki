const router = require('express').Router();
const { sendMessage, allMessages } = require('../controllers/messageController');
const { authGuard } = require('../middleware/authGaurd');

router.post('/send', authGuard, sendMessage);
router.get('/:chatId', authGuard, allMessages);

module.exports = router;
