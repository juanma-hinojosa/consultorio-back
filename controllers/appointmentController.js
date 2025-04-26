const Appointment = require('../models/Appointment');
const Specialty = require('../models/Specialty');

const createAppointment = async (req, res) => {
  const { fullName, telefono, date, time, specialtyId } = req.body;

  try {
    // Verificar si el turno ya existe
    const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
    if (date < today) {
      return res.status(400).json({ message: 'No se pueden reservar turnos en fechas pasadas.' });
    }
    const exists = await Appointment.findOne({ date, time, specialty: specialtyId });
    if (exists) {
      return res.status(400).json({ message: 'Este turno ya fue reservado.' });
    }

    // Crear el turno
    const newAppointment = new Appointment({ fullName, telefono, date, time, specialty: specialtyId });
    await newAppointment.save();

    // Actualizar la especialidad: eliminar ese horario de disponibles
    const specialty = await Specialty.findById(specialtyId);
    if (!specialty) {
      return res.status(404).json({ message: 'Especialidad no encontrada.' });
    }

    const updatedSlots = specialty.availableSlots.map(slot => {
      if (slot.date === date) {
        return {
          ...slot._doc,
          times: slot.times.filter(t => t !== time)
        };
      }
      return slot;
    });

    specialty.availableSlots = updatedSlots;
    await specialty.save();

    res.status(201).json({ message: 'Turno reservado con éxito.', appointment: newAppointment });
  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('specialty').sort({ date: 1, time: 1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error al obtener turnos:', err);
    res.status(500).json({ message: 'Error al obtener turnos.' });
  }
};


const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { fullName, date, time, status } = req.body;

  try {
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { fullName, date, time, status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Turno no encontrado' });

    res.json({ message: 'Turno actualizado con éxito', appointment: updated });
  } catch (err) {
    console.error('Error al actualizar turno:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    const { date, time, specialty } = appointment;

    // Eliminar el turno
    await appointment.deleteOne();

    // Buscar la especialidad
    const specialtyDoc = await Specialty.findById(specialty);
    if (!specialtyDoc) {
      return res.status(404).json({ message: 'Especialidad no encontrada.' });
    }

    // Ver si ya hay una entrada para ese día
    const existingSlot = specialtyDoc.availableSlots.find(slot => slot.date === date);

    if (existingSlot) {
      // Agregar el horario de nuevo si no está
      if (!existingSlot.times.includes(time)) {
        existingSlot.times.push(time);
        existingSlot.times.sort(); // Opcional: ordena los horarios
      }
    } else {
      // Si no hay una entrada para ese día, la agregamos
      specialtyDoc.availableSlots.push({ date, times: [time] });
    }

    await specialtyDoc.save();

    res.json({ message: 'Turno eliminado y horario liberado con éxito' });
  } catch (err) {
    console.error('Error al eliminar turno:', err);
    res.status(500).json({ message: 'Error al eliminar turno' });
  }
};




module.exports = { createAppointment, getAppointments, updateAppointment, deleteAppointment };
