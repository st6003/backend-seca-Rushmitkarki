// Importing the packages
const express = require("express");
const connectDatabase = require("./database/database");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const socketIo = require("socket.io");

// Creating an express app
const app = express();

// Express JSON configuration
app.use(express.json());

// create http server
const server = http.createServer(app);

// initialize socket io
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

// Dotenv configuration
dotenv.config();

// Connecting to the database
connectDatabase();

// Ensure the directory exists
const publicDir = path.join(__dirname, 'public');
const insuranceDir = path.join(publicDir, 'insurance');
if (!fs.existsSync(insuranceDir)) {
  fs.mkdirSync(insuranceDir, { recursive: true });
}

// File public
app.use(express.static(publicDir));

// Accepting form data
app.use(fileUpload({
  createParentPath: true, // Create directory if it does not exist
}));

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Defining the PORT
const PORT = process.env.PORT;

// setup socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('sendMessage', ({ senderId, receiverId, message }) => {
    io.to(receiverId).emit('getMessage', {
      senderId,
      message,
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
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
app.use("/api/khalti", require("./routes/khaltiRoutes"));

app.use("/api/message", require("./routes/messageRoutes"));


// Starting the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
