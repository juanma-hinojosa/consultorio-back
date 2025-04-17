const multer = require('multer');
const storage = multer.memoryStorage(); // o usá diskStorage si no subís a Cloudinary

module.exports = multer({ storage });
