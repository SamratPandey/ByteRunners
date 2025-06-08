# ByteRunners

AI-powered coding platform for learning and practicing programming through challenges, courses, and skill assessments.

## Features

- **User Authentication**: Secure login/registration with JWT
- **Coding Challenges**: Daily problems with multi-language support
- **AI Skills Assessment**: Personalized learning paths
- **Code Execution**: Real-time code testing via Judge0 API
- **Progress Tracking**: Analytics and performance insights
- **Admin Panel**: User and content management

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- npm/yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SamratPandey/ByteRunners.git
   cd ByteRunners
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5174
   - Backend: http://localhost:3001

## Environment Configuration

Create `.env` file in the backend directory:

```env
# Database
MONGO_URI="your-mongodb-connection-string"
DB_NAME="byteRunners"

# Authentication
JWT_SECRET="your-jwt-secret"

# Email Service
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# URLs
FRONTEND_URL="http://localhost:5174"
BACKEND_URL="http://localhost:3001"

# Code Execution (Optional)
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-rapidapi-key"

# Image Storage (Optional)
IMAGEKIT_API_URL="https://ik.imagekit.io/your-id"
IMAGEKIT_ID="your-imagekit-id"
IMAGEKIT_PUBLIC_KEY="your-public-key"
IMAGEKIT_PRIVATE_KEY="your-private-key"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Problems
- `GET /api/problems` - Get coding problems
- `POST /api/problems/:id/submit` - Submit solution

### User Profile
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

## Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Monaco Editor
- Redux for state management

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for password hashing

## Common Issues

**MongoDB Connection Error:**
- Verify MongoDB is running
- Check connection string in .env
- Ensure IP is whitelisted (MongoDB Atlas)

**Login Issues:**
- Verify JWT_SECRET is set
- Check email/password format
- Ensure cookies are enabled

**Email Service Issues:**
- Enable 2FA on Gmail and use App Password
- Verify EMAIL_USER and EMAIL_PASS in .env

## License

MIT License - see LICENSE file for details.

## Author

**Samrat Pandey**
- GitHub: [@SamratPandey](https://github.com/SamratPandey)
- Email: samratpandeyofficial02@gmail.com
