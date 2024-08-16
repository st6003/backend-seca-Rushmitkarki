const DoctorAppointment = require("../models/doctorAppointmentModel");

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const {
      patientName,
      appointmentDate,
      phoneNumber,
      email,
      appointmentDescription,
    } = req.body;
    const userId = req.user._id;

    const existingPendingAppointment = await DoctorAppointment.findOne({
      userId,
      status: "pending",
    });
    if (existingPendingAppointment) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You already have a pending appointment",
        });
    }

    const newAppointment = new DoctorAppointment({
      patientName,
      appointmentDate,
      phoneNumber,
      email,
      appointmentDescription,
      userId,
    });

    await newAppointment.save();
    res
      .status(201)
      .json({
        success: true,
        data: newAppointment,
        message: "Appointment completed",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch all appointments
const getUsersWithAppointments = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.isAdmin) {
      // Fetch all appointments for admins
      const appointments = await DoctorAppointment.find().populate(
        "userId",
        "firstName lastName email"
      );
      return res.status(200).json({ success: true, data: appointments });
    } else {
      // Fetch only the appointments for the current user
      const appointments = await DoctorAppointment.find({
        userId: req.user._id,
      }).populate("userId", "firstName lastName email");
      return res.status(200).json({ success: true, data: appointments });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch a single appointment by ID
const getAppointmentById = async (req, res) => {
  const appointmentId = req.params.id;
  const userId = req.user._id;

  try {
    const appointment = await DoctorAppointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    if (
      appointment.userId.toString() !== userId.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to view this appointment",
        });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an appointment
const updateAppointment = async (req, res) => {
  const {
    patientName,
    appointmentDate,
    phoneNumber,
    email,
    appointmentDescription,
  } = req.body;

  if (
    !patientName ||
    !appointmentDate ||
    !phoneNumber ||
    !email ||
    !appointmentDescription
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter all the fields." });
  }

  try {
    const appointment = await DoctorAppointment.findById(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    if (
      appointment.userId.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to update this appointment",
        });
    }

    appointment.patientName = patientName;
    appointment.appointmentDate = appointmentDate;
    appointment.phoneNumber = phoneNumber;
    appointment.email = email;
    appointment.appointmentDescription = appointmentDescription;

    await appointment.save();
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete an appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await DoctorAppointment.findById(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    // Check if the user is authorized to delete the appointment
    if (
      appointment.userId.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to delete this appointment",
        });
    }

    // Delete the appointment
    await DoctorAppointment.deleteOne({ _id: req.params.id });

    res
      .status(200)
      .json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve an appointment
const approveAppointment = async (req, res) => {
  try {
    const appointment = await DoctorAppointment.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel an appointment
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await DoctorAppointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: "canceled" },
      { new: true }
    );

    if (!appointment) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Appointment not found or you do not have permission to cancel this appointment",
        });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getUsersWithAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  approveAppointment,
  cancelAppointment,
};
