const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// Get all Messages
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

// Send a Message
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  // Validate chatId
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res.status(400).json({ message: "Invalid chatId" });
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "firstName").execPopulate();
    message = await message.populate({
      path: "chat",
      populate: {
        path: "users",
        select: "firstName",
      },
    }).execPopulate();

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};

module.exports = { allMessages, sendMessage };
