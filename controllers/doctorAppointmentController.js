const path = require("path");

const Doctorappointment = require("../models/doctorAppointmentModel");

// Create a new appointment
const createAppointment = async (req, res) => {
  console.log(req.body);
  
  const { patientName, appointmentDate, phoneNumber, email, appointmentDescription } = req.body;

  if (!patientName || !appointmentDate || !phoneNumber || !email || !appointmentDescription) {
    return res.status(400).json({
      success: false,
      message: "Please enter all the fields...",
    });
  }

  try {
    const newAppointment = new Doctorappointment({
      patientName,
      appointmentDate,
      phoneNumber,
      email,
      appointmentDescription,
    });

    const appointment = await newAppointment.save();
    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

// Fetch all appointments
const getUsersWithAppointments = async (req, res) => {
  try {
    const appointments = await Doctorappointment.find({}, 'patientName email appointmentDate');
    res.status(200).json({
      success: true,
      message: "Users with appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

// Fetch a single appointment by ID
const getAppointmentById = async (req, res) => {
  const appointmentId = req.params.id;
  try {
    const appointment = await Doctorappointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Appointment fetched successfully",
      appointment: appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

// Update an appointment
const updateAppointment = async (req, res) => {
  const { patientName, appointmentDate, phoneNumber, email, appointmentDescription } = req.body;

  if (!patientName || !appointmentDate || !phoneNumber || !email || !appointmentDescription) {
    return res.status(400).json({
      success: false,
      message: "Please enter all the fields...",
    });
  }

  try {
    const updatedAppointment = await Doctorappointment.findByIdAndUpdate(
      req.params.id,
      { patientName, appointmentDate, phoneNumber, email, appointmentDescription },
      { new: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

// Delete an appointment
const deleteAppointment = async (req, res) => {
  try {
    const deletedAppointment = await Doctorappointment.findByIdAndDelete(req.params.id);
    if (!deletedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error,
    });
  }
};

module.exports = {
  createAppointment,
  getUsersWithAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
