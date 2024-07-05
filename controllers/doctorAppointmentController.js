const path = require('path');
const doctorAppointmentModel = require('../models/doctorAppointmentModel');


const createDoctorAppointment = async (req, res) => {
    console.log(req.body);
    const { patientName, appointmentDate, phoneNumber, email, appointmentDescription } = req.body;
    
    if (!patientName || !appointmentDate || !phoneNumber || !email || !appointmentDescription) {
        return res.status(400).json({
        success: false,
        message: "Please enter all the fields...",
        });
    }
    
    try {
        const newDoctorAppointment = new doctorAppointmentModel({
        patientName: patientName,
        appointmentDate: appointmentDate,
        phoneNumber: phoneNumber,
        email: email,
        appointmentDescription: appointmentDescription,
        });
    
        await newDoctorAppointment.save();
    
        res.status(201).json({
        success: true,
        message: "Doctor Appointment created successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
    

}
module.exports={createDoctorAppointment};