require('dotenv').config()
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const siteRoutes = require('./routes/siteRoutes');
const courseRoutes = require('./routes/courseRoutes')
const jobRoutes = require('./routes/jobRoutes');
const testRoutes = require('./routes/testRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const Admin = require('./models/Admin');  
const { registerAdmin } = require('./controllers/adminController');
const multer = require('multer');

const app = express();

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
      const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://byterunners.onrender.com', // Production frontend
      'https://byterunners-frontend.onrender.com' // Alternative frontend URL
    ];
      if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  
  allowedHeaders: ['Content-Type', 'Authorization', 'x-checking-auth'],  
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'byterunners-oauth-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/byterunners',
    touchAfter: 24 * 3600, // lazy session update
    ttl: 7 * 24 * 60 * 60 // session TTL in seconds (7 days)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Allow cross-site cookies in production
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', userProfileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/test', testRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Generic error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Max limit is 2MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something broke!'
  });
});

const createDefaultAdmin = async () => {
  try {
    const admin = await Admin.findOne({ email: 'admin@gmail.com' });    if (!admin) {
      const req = {
        body: {
          username: 'admin',
          email: 'admin@gmail.com',
          password: 'admin', 
          role: 'superAdmin', 
          permissions: {
            manageUsers: true,
            manageCodingProblems: true,
            manageCodeExecutionSettings: true,
            viewAnalytics: true,
          },
        },
      };
        const res = {
        status: (statusCode) => ({
          json: (response) => {},
        }),
      };

      await registerAdmin(req, res);
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

createDefaultAdmin();  

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
