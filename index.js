// Importing the packages
const express = require("express");
const connectDatabase = require("./database/database");
const dotenv = require("dotenv");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

// Creating an express app
const app = express();

// Express JSON configuration
app.use(express.json());

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

// Defining routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/favourite", require("./routes/favouriteRoutes"));
app.use("/api/booking", require("./routes/doctorAppointmentRoute"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/insurance", require("./routes/insuranceRoute"));
app.use("/api/payment", require("./routes/paymentRoutes"))
app.use("/api/khalti",require("./routes/khaltiRoutes"))

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
