const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.json({
      success: false,
      message: "Please enter all the fields...",
    });
  }

  try {
    const existingUser = await userModel.findOne({ email: email });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists...",
      });
    }

    const randomsalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomsalt);

    const newUser = new userModel({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
    });

    console.log(newUser);

    res.json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Please enter all the fields...",
    });
  }

  try {
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found...",
      });
    }

    const isvalidPassword = await bcrypt.compare(password, user.password);
    if (!isvalidPassword) {
      return res.json({
        success: false,
        message: "Invalid credentials...",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      success: true,
      message: "Login successful...",
      token: token,
      userData: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Internal server error...",
    });
  }
};

module.exports = { createUser, loginUser };
