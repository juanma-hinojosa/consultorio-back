const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');

router.post('/', createAppointment);
router.get('/', getAppointments); // listar todos los turnos reservados
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
