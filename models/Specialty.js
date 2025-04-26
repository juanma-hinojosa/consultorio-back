const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  date: String, // formato YYYY-MM-DD
  times: [String] // ej: ["10:00", "10:30"]
});

const SpecialtySchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  image: String,
  availableSlots: [SlotSchema]
});

module.exports = mongoose.model('Specialty', SpecialtySchema);
