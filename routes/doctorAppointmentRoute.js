
const express = require('express');
const router = express.Router();
const doctorAppointmentController = require('../controllers/doctorAppointmentController');
const { authGuard } = require('../middleware/authGaurd');

// Routes
router.post('/create_appointments', authGuard, doctorAppointmentController.createAppointment);
router.get('/users_with_appointments', doctorAppointmentController.getUsersWithAppointments);
router.get('/appointments/:id', doctorAppointmentController.getAppointmentById);
router.put('/update_appointments/:id', doctorAppointmentController.updateAppointment);
router.delete('/delete_appointments/:id', doctorAppointmentController.deleteAppointment);

module.exports = router;
