const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// Get all Messages
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender")
      .populate("chat")

      .populate({
        path: "chat",
        populate: {
          path: "users",
          model: "User",
        },
      })
      .populate({
        path: "chat",
        populate: {
          path: "groupAdmin",
          model: "User",
        },
      });
    res.status(200).json({ messages: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Send a Message
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    console.log("Invalid data is passed");
    return res.sendStatus(400);
  }
  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
    });
    message = await User.populate(message, {
      path: "chat.groupAdmin",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(200).json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { allMessages, sendMessage };
