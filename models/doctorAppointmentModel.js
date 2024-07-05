const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Doctorappointment = new Schema({
    patientName: {
        type: String,
        required: true,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    appointmentDescription: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});
module.exports = mongoose.model('Doctorappointment', Doctorappointment);