const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  telefono: { type: String, required: true },
  date: { type: String, required: true }, // formato YYYY-MM-DD
  time: { type: String, required: true }, // formato HH:mm
  specialty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Specialty',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmado', 'cancelado'],
    default: 'pendiente'
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
