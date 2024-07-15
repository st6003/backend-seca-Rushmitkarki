const mongoose = require("mongoose");

const insuranceSchema = new mongoose.Schema(
  {
    insuranceName: {
      type: String,
      required: true,
    },
    insurancePrice: {
      type: Number,
      required: true,
    },
    insuranceDescription: {
      type: String,
      required: true,
    },
    insuranceImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Insurance = mongoose.model("Insurance", insuranceSchema);
module.exports = Insurance;
