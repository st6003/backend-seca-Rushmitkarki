const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "firstName")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

//@description     Send a Message
//@route           POST /api/message/
//@access          Protected
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message
      .populate("sender", "firstName")
      .populate("chat")
      .execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "firstName",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};

module.exports = { allMessages, sendMessage };
