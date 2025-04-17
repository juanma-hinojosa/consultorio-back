// routes/flyerRoutes.js
const express = require('express');
const router = express.Router();
const { createFlyer, getActiveFlyer, getFlyers, updateFlyer, deleteFlyer } = require('../controllers/flyerController');
const auth = require('../middleware/authMiddleware');  // Verificar que sea admin
const upload = require('../middleware/multer');  // Para manejar la subida de imagenes

const uploadSingleImage = upload.single('image');  // Para subir una sola imagen

// Crear flyer (solo admin)
router.post('/flyers', auth, uploadSingleImage, createFlyer);

// Obtener flyer activo
router.get('/flyers', getActiveFlyer);

// Obtener todos los flyers
router.get('/flyers/all', auth, getFlyers);


router.delete('/flyers/:id', auth, deleteFlyer);
router.put('/flyers/:id', auth, uploadSingleImage, updateFlyer);


module.exports = router;
