// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const admin = await Admin.findOne({ username: identifier });
    if (!admin) return res.status(404).json({ message: 'Admin no encontrado' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '365d' // o ponelo a "9999 years" si querés que no expire nunca
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

module.exports = router;
