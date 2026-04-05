// Core Modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); // Import CORS
require('dotenv').config(); // Import and configure dotenv

// Database
let mongoose = require('mongoose');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// --- Middlewares ---

// CORS configuration to allow requests from the frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Use environment variable for frontend URL
  credentials: true // Allow cookies to be sent
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/CAFFEHANHPHUC';
mongoose.connect(MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB at ${MONGODB_URI}`);
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// --- API Routes ---
app.use('/api/v1/', require('./routes/index'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/orders', require('./routes/orders'));
app.use('/api/v1/reviews', require('./routes/reviews'));
app.use('/api/v1/inventories', require('./routes/inventories'));
app.use('/api/v1/carts', require('./routes/carts'));
app.use('/api/v1/reservations', require('./routes/reservations'));
app.use('/api/v1/payments', require('./routes/payments'));
app.use('/api/v1/upload', require('./routes/upload'));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ // Send JSON response for API errors
    error: {
      message: err.message
    }
  });
});

module.exports = app;
