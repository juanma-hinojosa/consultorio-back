// app.js 
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes')
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/blogs', blogRoutes);

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API del blog funcionando!');
});
const flyerRoutes = require('./routes/flyerRoutes');
app.use('/api', flyerRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

const specialtyRoutes = require('./routes/specialtyRoutes');
app.use('/api/specialties', specialtyRoutes);

module.exports = app;
