// server.js 
const app = require('./app');
const mongoose = require('mongoose');
const cron = require('node-cron');
const Appointment = require('./models/Appointment');
const Specialty = require('./models/Specialty');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
  })
  .catch((err) => console.error('Error conectando a MongoDB:', err));

cron.schedule('0 3 * * *', async () => {
  const today = new Date().toISOString().split('T')[0];

  try {
    // Borrar turnos anteriores a hoy
    const result = await Appointment.deleteMany({ date: { $lt: today } });
    console.log(`Turnos eliminados: ${result.deletedCount}`);

    // Opcional: limpiar horarios pasados de cada especialidad
    const specialties = await Specialty.find();
    for (let spec of specialties) {
      spec.availableSlots = spec.availableSlots.filter(slot => slot.date >= today);
      await spec.save();
    }

    console.log('Limpieza de horarios disponibles completada.');
  } catch (error) {
    console.error('Error en tarea de limpieza:', error);
  }
});