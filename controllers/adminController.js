const User = require('../models/userModel');
const Doctor = require('../models/doctorModel');
const DoctorAppointment = require('../models/doctorAppointmentModel');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUserLogins = await User.countDocuments({});
    const totalDoctorsAdded = await Doctor.countDocuments({});
    const totalAppointments = await DoctorAppointment.countDocuments({});

    res.status(200).json({
      totalUserLogins,
      totalDoctorsAdded,
      totalAppointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};