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
  if(!content || !chatId) {
    console.log("Invalid data is passed")
    return res.sendStatus(400);
  }
  var newMessage={
    sender: req.user._id,
    content: content,
    chat: chatId
  }
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender","name email")
    message = await message.populate("chat")
    message = await User.populate(message,{
      path: "chat.users",
      select: "name email"
    })
    await Chat.findByIdAndUpdate(req.body.chatId,{
      latestMessage: message,
    })
    res.status(200).send(message);

    
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
    
  }
};

module.exports = { allMessages, sendMessage };
