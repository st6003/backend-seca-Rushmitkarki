const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const createUser = async (req, res) => {
  //  1.Check incomming data
  console.log(req.body);
  //  2. Destructure the incomming data
  const { firstName, lastName, email, password } = req.body;
  //  3. Validate the data(if empty stop the process)
  if (!firstName || !lastName || !email || !password) {
    // res.send("please enter all the fields")
    return res.json({
      success: false,
      message: "please enter all the field...",
    });
  }

  //  4. Handaling the error (TRY, Catch)
  // 5.check if the user is already registered

  try {
    const existingUser = await userModel.findOne({ email: email });

    // 5.a) if user found: Send response (user already exsit)
    if (existingUser) {
      return res.json({
        success: false,
        message: "user Already Exists.... ",
      });
    }
    //  Hashing or encyption the password
    const randomsalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, randomsalt);

    // 5.c) if user is new:
    const newUser = new userModel({
      // Database fields : clients value
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
    });

    //  save to database
    await newUser.save();

    //  send respomse
    res.json({
      success: true,
      message: "user created successfully",
    });
    //  Hash the password
    //  save to the database
    // send succesfull response
  } catch (error) {
    res.json({
      success: false,
      message: "Internal server error",
    });
  }
};

//  Logic for login
const loginUser = async (req, res) => {
  // checking imcomming data
  console.log(req.body);
  // destructuring the incomming data
  const { email, password } = req.body;
  // validate the data
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Please enter all the fields...",
    });
  }
  // validate the data
  try {
    const user = await userModel.findOne({ email: email });

    // if user not found
    if (!user) {
      return res.json({
        success: false,
        message: "user not found...",
      });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({
        success: false,
        message: "Invalid credentials...",
      });
    }
    // token generation and secret key
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // response token
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
    // password matched
  } catch (error) {
    res.json({
      success: false,
      message: "login success",
    });
  }
};

module.exports = { createUser, loginUser };
