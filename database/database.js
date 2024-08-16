const mongoose = require("mongoose");
const color = require("colors");

// External file
// Functions (Connection to database )
// Make a unique function name
// Export
const connectDatabase = () => {
  mongoose.connect(process.env.MONGODB_CLOUD).then(() => {
    console.log("Database Connected".yellow.bold);
  });
};

// Exporting the function

module.exports = connectDatabase;
