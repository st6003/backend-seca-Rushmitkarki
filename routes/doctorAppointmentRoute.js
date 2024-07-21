const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getUsersWithAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  approveAppointment,
  cancelAppointment,
} = require('../controllers/doctorAppointmentController');
const { authGuard } = require('../middleware/authGaurd');

// Routes
router.post('/create_appointments', authGuard, createAppointment);
router.get('/users_with_appointments', authGuard, getUsersWithAppointments);
router.get('/appointments/:id', authGuard, getAppointmentById);
router.put('/update_appointments/:id', authGuard, updateAppointment);
router.delete('/delete_appointments/:id', authGuard, deleteAppointment);
router.put('/approve_appointment/:id', authGuard, approveAppointment);
router.put('/cancel_appointment/:id', authGuard, cancelAppointment);

module.exports = router;
