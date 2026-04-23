const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
require('dotenv').config();

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'CampusConnect API is running' });
});

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/organizer', require('./src/routes/organizer.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/student', require('./src/routes/student.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));