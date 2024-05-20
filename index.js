const express = require("express");
const connectDatabase = require("./database/database");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();

app.use(express.json());

dotenv.config();

connectDatabase();

const PORT = process.env.PORT;

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.listen(PORT, () => {
  console.log(`Serveer is running on port ${PORT}...`);
});
