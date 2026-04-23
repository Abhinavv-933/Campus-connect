const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "https://campus-connect-abd.vercel.app"
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS blocked: " + origin));
  },
  credentials: true
}));

// 🔹 Middlewares
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// 🔹 Health Check
app.get('/', (req, res) => {
  res.send("API Running 🚀");
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'CampusConnect API is running' });
});

// 🔹 Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/organizer', require('./src/routes/organizer.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/student', require('./src/routes/student.routes'));

// 🔹 Start Server ONLY after DB connects
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1); // crash intentionally (Render restart karega)
  });