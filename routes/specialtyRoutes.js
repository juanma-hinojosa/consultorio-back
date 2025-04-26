const express = require('express');
const router = express.Router();
const { addAvailableSlots, getAllSpecialties, getSpecialtyById, updateSlots, deleteSlots } = require('../controllers/specialtyController');

router.get('/', getAllSpecialties); // <-- ESTA RUTA ES LA QUE NECESITAS
router.get('/:id', getSpecialtyById);
router.post('/add-available-slots', addAvailableSlots);
router.put('/update-slots', updateSlots);
router.delete('/delete-slots', deleteSlots);

module.exports = router;
