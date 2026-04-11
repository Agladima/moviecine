require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api', limiter);

// Body Parsing & Logging
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// Routes
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 MoodCine server running on port ${PORT}`));
