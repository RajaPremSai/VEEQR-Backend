const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const managerRoutes = require('./routes/manager');
const usersRoutes = require('./routes/users');
const guardsRoutes = require('./routes/securityGuards');

const errorHandler = require('./middleware/error');
const notFound = require('./middleware/notFound');

const app = express();
connectDB();

// Ensure uploads directories
const uploadsRoot = path.join(__dirname, 'uploads');
const qrDir = path.join(uploadsRoot, 'qrcodes');
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot);
if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir);

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
});
app.use('/api', limiter);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173','http://20.30.67.112:5173','http://192.168.29.52:5173'],
  credentials: true
}));

app.use(compression());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/security-guards', guardsRoutes);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => console.log(`API running on port ${PORT}`));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app; 