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

  try {
    if (!content || !chatId) {
      return res.status(400).json({ message: "Content and chatId are required" });
    }

    // Additional validation logic if needed

    // Create message in MongoDB
    const newMessage = {
      sender: req.user._id, // Assuming req.user is populated with sender's ID
      content,
      chat: chatId,
    };

    let message = await Message.create(newMessage);

    // Populate sender and chat details
    message = await message
      .populate("sender", "firstName") // Assuming sender is referenced as an ObjectId in the message schema
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "firstName", // Assuming users is an array of ObjectId references in the chat schema
        },
      })
      .execPopulate();

    // Update latestMessage in Chat model
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    // Send response back to client
    res.status(201).json(message); // Assuming 201 Created status for successful creation
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(400).json({ message: error.message }); // Send error message to client
  }
};

module.exports = { allMessages, sendMessage };
