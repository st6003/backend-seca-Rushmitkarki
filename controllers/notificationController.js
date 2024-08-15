const Notification = require('../models/notificationModel');

exports.createNotification = async (req, res) => {
  console.log(req.body);
  const { message, receiver } = req.body;
  const { sender } = req.body;

  // Validate
  if (!message || !receiver) {
    return res.status(400).json({
      message: 'Please enter all fields',
      success: false,
    });
  }

  try {
    const newNotification = new Notification({
      message: message,
      receiver: receiver,
      timestamp: new Date(),
    });

    await newNotification.save();

    res.status(200).json({
      message: `Notification received successfully from ${sender}`,
      success: true,
      newNotification: newNotification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
      error,
      success: false,
    });
  }
};