const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const Admin = require('./models/Admin');  // Import the Admin model
const { registerAdmin } = require('./controllers/adminController'); // Import the registerAdmin function
require('dotenv').config();

const app = express();

connectDB();

// Middleware setup
app.use(cors({
  origin: 'http://localhost:5173',  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  allowedHeaders: ['Content-Type', 'Authorization'],  
  credentials: true,  
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

const createDefaultAdmin = async () => {
  try {
    const admin = await Admin.findOne({ email: 'admin@example.com' });  // Check if an admin exists by email or another identifier
    if (!admin) {
      console.log('Default admin not found, creating...');
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
          json: (response) => console.log(response),
        }),
      };

      await registerAdmin(req, res);
    } else {
      console.log('Default admin already exists');
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
