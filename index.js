// Importing the packages
const express = require("express");
const connectDatabase = require("./database/database");
const dotenv = require("dotenv");
const cors = require("cors");
const acceptFormData = require("express-fileupload");

// Creating an express app
const app = express();

// Express JSON configuration
app.use(express.json());

// Dotenv configuration
dotenv.config();

// Connecting to the database
connectDatabase();

// Defining the PORT
const PORT = process.env.PORT;

// Accepting form data
app.use(acceptFormData());

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Defining routes
app.use("/api/user", require("./routes/userRoutes"));

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
