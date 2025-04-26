const Specialty = require('../models/Specialty');

const getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Specialty.find();
    res.json(specialties);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las especialidades' });
  }
};

const addAvailableSlots = async (req, res) => {
  const { specialtyId, date, times } = req.body;

  try {
    const specialty = await Specialty.findById(specialtyId);
    if (!specialty) {
      return res.status(404).json({ message: 'Especialidad no encontrada.' });
    }

    // Verificar si ya hay slots para esa fecha
    const slot = specialty.availableSlots.find(s => s.date === date);

    if (slot) {
      // Evitar horarios duplicados
      const newTimes = [...new Set([...slot.times, ...times])];
      slot.times = newTimes;
    } else {
      // Agregar nueva fecha con horarios
      specialty.availableSlots.push({ date, times });
    }

    await specialty.save();
    res.status(200).json({ message: 'Horarios disponibles actualizados.', availableSlots: specialty.availableSlots });
  } catch (error) {
    console.error('Error al agregar horarios:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};


const getSpecialtyById = async (req, res) => {
  const { id } = req.params;
  try {
    const specialty = await Specialty.findById(id);
    if (!specialty) {
      return res.status(404).json({ message: 'Especialidad no encontrada.' });
    }
    res.json(specialty);
  } catch (error) {
    console.error('Error al obtener la especialidad por ID:', error);
    res.status(500).json({ message: 'Error del servidor.' });
  }
};

const updateSlots = async (req, res) => {
  const { specialtyId, date, times } = req.body;
  try {
    const specialty = await Specialty.findById(specialtyId);
    const slot = specialty.availableSlots.find(s => s.date === date);
    if (!slot) return res.status(404).json({ message: 'Fecha no encontrada' });

    slot.times = times;
    await specialty.save();
    res.json({ message: 'Horarios actualizados', availableSlots: specialty.availableSlots });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar horarios' });
  }
};

const deleteSlots = async (req, res) => {
  const { specialtyId, date } = req.body;
  try {
    const specialty = await Specialty.findById(specialtyId);
    specialty.availableSlots = specialty.availableSlots.filter(s => s.date !== date);
    await specialty.save();
    res.json({ message: 'Horarios eliminados' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar horarios' });
  }
};


module.exports = {
  getAllSpecialties,
  addAvailableSlots,
  getSpecialtyById,
  updateSlots,
  deleteSlots
};
