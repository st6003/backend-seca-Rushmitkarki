const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  conformPassword: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    required: true,
    default: "user",
  },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
