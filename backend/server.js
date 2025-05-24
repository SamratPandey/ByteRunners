require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const siteRoutes = require('./routes/siteRoutes');
const courseRoutes = require('./routes/courseRoutes')
const jobRoutes = require('./routes/jobRoutes');
const Admin = require('./models/Admin');  
const { registerAdmin } = require('./controllers/adminController');


const app = express();

connectDB();


app.use(cors({
  origin: `${process.env.FRONTEND_URL}`,  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  allowedHeaders: ['Content-Type', 'Authorization', 'x-checking-auth'],  
  credentials: true,  
}));
                  
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/site',siteRoutes);
app.use('/api/course',courseRoutes);
app.use('/api/jobs', jobRoutes);

const createDefaultAdmin = async () => {
  try {
    const admin = await Admin.findOne({ email: 'admin@gmail.com' }); 
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
