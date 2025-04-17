// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middleware/authMiddleware'); // verifica admin con JWT
const upload = require('../middleware/multer');

// campos: mainImage, contentImages[], extraImages[]
const uploadFields = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 },
    { name: /^extraImages-\d+$/ }
    // { name: 'extraImages', maxCount: 10 }
]);

// Rutas del blog
router.post('/', auth, uploadFields, blogController.createBlog);
router.get('/', blogController.getAllBlogs);
router.put('/:id', auth, uploadFields, blogController.updateBlog);
router.get('/:id', blogController.getBlogById);
router.delete('/:id', auth, blogController.deleteBlog);

module.exports = router;
