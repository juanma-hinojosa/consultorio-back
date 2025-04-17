const mongoose = require('mongoose');

const flyerSchema = new mongoose.Schema({
    imageUrl: String,
    text: String,
    paragraph: String,
    expirationDate: Date,  // Fecha de expiración
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Relación con el admin
}, { timestamps: true });

module.exports = mongoose.model('Flyer', flyerSchema);
