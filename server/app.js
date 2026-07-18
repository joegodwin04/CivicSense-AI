const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

// Initialize Express
const app = express();
// Trust Render's proxy
app.set('trust proxy', 1);

// --- Security & Utility Middlewares (Enterprise Standard) ---
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

// CORS configuration for dynamic origin mirroring (required when credentials are true)
app.use(cors({
  origin: function (origin, callback) {
    // Allow any requesting origin dynamically to prevent CORS blocks
    callback(null, true);
  },
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads (images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// HTTP Request Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting (Prevent DDoS / Brute Force on Government APIs)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// --- Routes ---
app.use('/api/health', (req, res) => res.status(200).json({ status: 'OK', timestamp: new Date() }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/citizen', require('./routes/citizenRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// --- Error Handling (Must be after all routes) ---
app.use(errorHandler);

module.exports = app;
