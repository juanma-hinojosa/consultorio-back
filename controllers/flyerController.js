// controllers/flyerController.js
const Flyer = require('../models/Flyer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Subir imagen a Cloudinary
const uploadToCloudinary = (buffer, folder = 'flyers') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// Crear flyer
const createFlyer = async (req, res) => {
    try {
        const { text, paragraph, expirationDate } = req.body;
        const image = req.file;

        if (!image) {
            return res.status(400).json({ error: 'La imagen es obligatoria' });
        }

        const fechaExp = new Date(expirationDate);
        if (isNaN(fechaExp)) {
            return res.status(400).json({ error: 'Fecha inválida' });
        }

        const imageUrl = await uploadToCloudinary(image.buffer);

        const flyer = new Flyer({
            text,
            paragraph,
            imageUrl,
            expirationDate: fechaExp,
            createdBy: req.user._id,
        });

        const savedFlyer = await flyer.save();
        res.status(201).json(savedFlyer);
    } catch (err) {
        console.error('Error al crear flyer:', err);
        res.status(500).json({ error: 'Error al crear el flyer' });
    }
};


// Obtener flyer activo
const getActiveFlyer = async (req, res) => {
    try {
        const flyer = await Flyer.findOne({ expirationDate: { $gte: new Date() } }).sort({ createdAt: -1 });
        if (!flyer) {
            return res.status(404).json({ message: 'No hay flyer activo' });
        }
        res.status(200).json(flyer);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el flyer' });
    }
};

const getFlyers = async (req, res) => {
    try {
        const flyers = await Flyer.find().sort({ createdAt: -1 });
        res.status(200).json(flyers);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los flyers' });
    }
};

// Eliminar flyer
const deleteFlyer = async (req, res) => {
    try {
        const flyer = await Flyer.findByIdAndDelete(req.params.id);
        if (!flyer) return res.status(404).json({ message: 'Flyer no encontrado' });
        res.status(200).json({ message: 'Flyer eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar flyer' });
    }
};

// Actualizar flyer
const updateFlyer = async (req, res) => {
    try {
        const { text, paragraph, expirationDate } = req.body;
        const flyer = await Flyer.findById(req.params.id);
        if (!flyer) return res.status(404).json({ message: 'Flyer no encontrado' });

        flyer.text = text || flyer.text;
        flyer.paragraph = paragraph || flyer.paragraph;
        flyer.expirationDate = expirationDate || flyer.expirationDate;

        if (req.file) {
            const imageUrl = await uploadToCloudinary(req.file.buffer);
            flyer.imageUrl = imageUrl;
        }

        const updatedFlyer = await flyer.save();
        res.status(200).json(updatedFlyer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar flyer' });
    }
};



module.exports = { createFlyer, getActiveFlyer, getFlyers, updateFlyer, deleteFlyer};
