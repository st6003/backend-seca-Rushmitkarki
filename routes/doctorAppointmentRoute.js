
const express = require('express');
const router = express.Router();
const doctorAppointmentController = require('../controllers/doctorAppointmentController');

// Routes
router.post('/create_appointments', doctorAppointmentController.createAppointment);
router.get('/get_appointments', doctorAppointmentController.getAppointments);
router.get('/appointments/:id', doctorAppointmentController.getAppointmentById);
router.put('/update_appointments/:id', doctorAppointmentController.updateAppointment);
router.delete('/delete_appointments/:id', doctorAppointmentController.deleteAppointment);

module.exports = router;
