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
const { initSocket } = require("./service/socketService");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Creating an express app
const app = express();

// Express JSON configuration
app.use(express.json());

// setup password

// Create HTTP server
const server = http.createServer(app);
initSocket(server);

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
  })
);

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
app.use("/api/notification", require("./routes/notificationRoutes"));

// Starting the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`.blue.bold);
});

module.exports = app;
