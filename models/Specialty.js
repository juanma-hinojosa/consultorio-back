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
  practices: [String], // <<--- NUEVO: lista de prácticas
  videoUrl: String,     // <<--- NUEVO: URL del video de YouTube (o iframe si preferís)
  availableSlots: [SlotSchema]
});

module.exports = mongoose.model('Specialty', SpecialtySchema);
