const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    required: true,
  },
  doctorField: {
    type: String,
    required: true,
  },
  doctorExperience: {
    type: Number,
    required: true,
  },
  doctorFee: {
    type: Number,
    required: true,
  },
  doctorImage: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
