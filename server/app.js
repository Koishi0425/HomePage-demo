require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const illustrationRoutes = require('./routes/illustration');
const homepageRoutes = require('./routes/homepage');
const templateRoutes = require('./routes/template');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/illustration_platform')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/illustrations', illustrationRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/templates', templateRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    code: 500, 
    msg: '服务器错误', 
    error: process.env.NODE_ENV === 'production' ? null : err.message 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
