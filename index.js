const express = require("express");
const connectDatabase = require("./database/database");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const socketIo = require("socket.io");
const colors = require("colors");
const session = require("express-session"); 
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;



// Creating an express app
const app = express();





// Express JSON configuration
app.use(express.json());



// setup password



// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = socketIo(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

// Dotenv configuration
dotenv.config();

// Connecting to the database
connectDatabase();

// Ensure the directory exists
const publicDir = path.join(__dirname, "public");
const insuranceDir = path.join(publicDir, "insurance");
if (!fs.existsSync(insuranceDir)) {
  fs.mkdirSync(insuranceDir, { recursive: true });
}

// File public
app.use(express.static(publicDir));

// Accepting form data
app.use(
  fileUpload({
    createParentPath: true,
  })
);

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Defining the PORT
const PORT = process.env.PORT || 5000;

//express session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,

  }));

  // passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // passport google strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET_ID,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, (accessToken, refreshToken, profile, done) => {

    console.log(profile);
    return done(null, profile);
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
  

// Setup socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
    console.log(`User left chat: ${chatId}`);
  });

  socket.on("send_Message", (messageData) => {
    io.to(message.chatId).emit("newMessage", messageData);
    console.log("message sent:", messageData);
  });

  socket.on("addUser", (data) => {
    io.to(data.chatId).emit("userAdded", data.user);
  });

  socket.on("removeUser", (data) => {
    io.to(data.chatId).emit("userRemoved", data.userId);
  });

  socket.on("leaveGroup", (data) => {
    io.to(data.chatId).emit("userLeft", data.userId);
  });

  socket.on("createGroup", (group) => {
    io.emit("newGroup", group);
    console.log(`New group created: ${group.name}`);
  });

  socket.on("updateGroup", (group) => {
    io.to(group._id).emit("groupUpdated", group);
    console.log(`Group updated: ${group.name}`);
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Defining routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/favourite", require("./routes/favouriteRoutes"));
app.use("/api/booking", require("./routes/doctorAppointmentRoute"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/insurance", require("./routes/insuranceRoute"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/message", require("./routes/messageRoutes"));
app.use("/api/rating", require("./routes/reviewRoute"));

// Starting the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`.blue.bold);
});
