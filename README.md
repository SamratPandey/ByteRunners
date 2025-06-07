# 🏃‍♂️ ByteRunners - AI-Powered Coding Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
[![Security](https://img.shields.io/badge/Security-Enabled-brightgreen.svg)](#-security-features)

> **ByteRunners** is a comprehensive AI-powered coding platform designed for students and developers to enhance their programming skills through personalized learning experiences, coding challenges, and intelligent performance analytics. Built with modern security practices and scalable architecture.

## 📋 Table of Contents

- [🎯 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Installation Guide](#️-installation-guide)
- [🔧 Configuration](#-configuration)
- [🔒 Security Setup](#-security-setup)
- [📚 API Documentation](#-api-documentation)
- [🎨 User Interface Guide](#-user-interface-guide)
- [🧪 Testing](#-testing)
- [📦 Deployment](#-deployment)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Features

### 🔐 **User Management & Authentication**
- **Secure Registration & Login**: JWT-based authentication with bcrypt password hashing (12 rounds)
- **Email Verification**: Account activation via secure, time-limited email tokens
- **Password Recovery**: Secure password reset with cryptographically secure tokens
- **Profile Management**: Customizable user profiles with progress tracking and photo uploads
- **Role-Based Access Control**: Student and Admin role management with permission layers

### 🧠 **AI-Powered Learning**
- **Personalized Onboarding**: AI-driven skill assessment and adaptive learning path generation
- **Intelligent Problem Generation**: Dynamic coding challenges based on user skill level and preferences
- **Smart Recommendations**: Personalized study suggestions using machine learning algorithms
- **Performance Analytics**: AI-powered analysis of coding patterns, time complexity, and improvement areas
- **Adaptive Difficulty**: Real-time difficulty adjustment based on user performance

### 💻 **Advanced Coding Environment**
- **Multi-Language Support**: JavaScript, Python, Java, C++, C, Go, Rust, and more
- **Real-Time Code Execution**: Secure sandboxed execution via Judge0 API with 64-bit architecture
- **Monaco Editor Integration**: VSCode-like editing experience with IntelliSense
- **Live Code Analysis**: Real-time syntax checking and error detection
- **Test Case Validation**: Comprehensive automated testing with detailed feedback

### 📊 **Progress Tracking & Analytics**
- **Comprehensive Skill Assessment**: Multi-dimensional coding ability evaluation
- **Visual Progress Dashboard**: Interactive charts showing learning progression
- **Achievement System**: Gamified learning with 50+ badges and milestones
- **Performance Insights**: Detailed analytics on solving patterns and time efficiency
- **Competitive Rankings**: Global and regional leaderboards

### 🎓 **Learning Resources**
- **Structured Learning Paths**: Progressive courses from beginner to advanced
- **Daily Coding Challenges**: Fresh algorithmic problems updated every 24 hours
- **Interview Preparation Hub**: Mock technical interviews with AI feedback
- **Video Tutorials**: Integrated learning content with code examples
- **Community Discussion**: Peer collaboration and solution sharing

### 💼 **Career Development Tools**
- **AI Job Matching**: Intelligent job recommendations based on skills and preferences
- **Portfolio Builder**: Showcase coding projects and achievements
- **Skill Certification**: Earn verified certificates for completed courses
- **Interview Tracker**: Manage and track interview processes
- **Resume Integration**: Export skills and achievements for professional use

## 🏗️ Architecture

### **Frontend Technology Stack**
- **React 18.2+**: Modern functional components with concurrent features
- **Vite 6.0+**: Ultra-fast build tool with HMR and optimized bundling
- **Tailwind CSS 3.x**: Utility-first CSS framework with custom design system
- **ShadCN UI**: Accessible, customizable component library
- **Monaco Editor**: Advanced code editor with language support
- **Framer Motion**: Smooth animations and transitions
- **React Router 6**: Type-safe client-side routing
- **Axios**: HTTP client with interceptors and error handling

### **Backend Technology Stack**
- **Node.js 18+**: JavaScript runtime with ES2022 support
- **Express.js 4.x**: Minimal web framework with middleware architecture
- **MongoDB 7.x**: Document database with aggregation pipelines
- **Mongoose 8.x**: Elegant MongoDB object modeling
- **JWT**: Stateless authentication with RS256 signing
- **Bcrypt**: Password hashing with configurable salt rounds
- **Joi**: Schema validation for request/response data
- **Nodemailer**: SMTP email service integration

### **Third-Party Service Integration**
- **Judge0 API**: Secure, isolated code execution environment
- **OpenAI GPT-4**: Advanced AI for personalized learning (optional)
- **HuggingFace**: Open-source AI models (fallback option)
- **ImageKit**: Optimized image storage and transformation
- **MongoDB Atlas**: Cloud database with automatic scaling

### **Security Infrastructure**
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: API endpoint protection against abuse
- **Input Validation**: Comprehensive request sanitization
- **Error Handling**: Secure error responses without information leakage

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0+ ([Download](https://nodejs.org/))
- **npm** 8.0+ or **yarn** 1.22+
- **MongoDB** 7.0+ (local) or MongoDB Atlas account
- **Git** for version control

### 🏃‍♂️ 5-Minute Setup

1. **Clone and Navigate**
   ```bash
   git clone https://github.com/SamratPandey/ByteRunners.git
   cd ByteRunners
   ```

2. **Backend Quick Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

3. **Frontend Quick Setup** (New Terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3001](http://localhost:3001)

> ⚠️ **Important**: You must configure environment variables before the application will function properly. See [Configuration](#-configuration) section.

---

## ⚙️ Installation Guide

### Backend Installation

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with the following structure:
   ```env
   # Database Configuration
   MONGO_URI="your-mongodb-connection-string"
   DB_NAME="byteRunners"
   
   # Authentication Security
   JWT_SECRET="your-256-bit-secret-key"
   
   # Email Configuration
   EMAIL_USER="your-smtp-email@domain.com"
   EMAIL_PASS="your-app-specific-password"
   
   # Application URLs
   FRONTEND_URL="http://localhost:5173"
   BACKEND_URL="http://localhost:3001"
   
   # Code Execution Service
   JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
   JUDGE0_API_KEY="your-rapidapi-key"
   
   # Image Storage Service
   IMAGEKIT_API_URL="https://ik.imagekit.io/your-id"
   IMAGEKIT_ID="your-imagekit-id"
   IMAGEKIT_PUBLIC_KEY="your-public-key"
   IMAGEKIT_PRIVATE_KEY="your-private-key"
   
   # AI Service Configuration (Optional)
   OPENAI_API_KEY="your-openai-api-key"
   HUGGINGFACE_API_KEY="your-huggingface-api-key"
   AI_PROVIDER="openai"  # or "huggingface"
   ```

4. **Start Development Server**
   ```bash
   npm run dev    # Development with nodemon
   # OR
   npm start      # Production mode
   ```

### Frontend Installation

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration** (Optional)
   Create a `.env.local` file for frontend-specific variables:
   ```env
   VITE_API_BASE_URL="http://localhost:3001"
   VITE_APP_NAME="ByteRunners"
   ```

4. **Start Development Server**
   ```bash
   npm run dev      # Development server with HMR
   npm run build    # Production build
   npm run preview  # Preview production build
   ```

---

## 🔧 Configuration

### Database Setup

#### MongoDB Atlas (Recommended for Production)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Set up database user with read/write permissions
4. Configure network access (IP whitelist)
5. Get connection string and update `MONGO_URI`

#### Local MongoDB Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Windows - Download from MongoDB website
```

### Email Service Configuration

#### Gmail SMTP Setup
1. Enable 2-Factor Authentication on Gmail
2. Generate App-Specific Password
3. Use credentials in environment variables:
   ```env
   EMAIL_USER="your-gmail@gmail.com"
   EMAIL_PASS="your-16-character-app-password"
   ```

#### Alternative SMTP Providers
- **SendGrid**: Professional email delivery
- **Mailgun**: Developer-friendly email API
- **AWS SES**: Scalable email service

### Third-Party Service Setup

#### Judge0 API (Code Execution)
1. Sign up at [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Subscribe to Judge0 CE API
3. Get API key and update environment variables

#### ImageKit (Image Storage)
1. Create account at [ImageKit](https://imagekit.io)
2. Get API credentials from dashboard
3. Configure environment variables

#### AI Services (Optional)
- **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/)
- **HuggingFace**: Get API key from [HuggingFace](https://huggingface.co/settings/tokens)

---

## 🔒 Security Setup

### JWT Configuration
```javascript
// Generate secure JWT secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Password Security
- Minimum 8 characters
- Must include uppercase, lowercase, number, and special character
- Bcrypt hashing with 12 salt rounds
- Password reset tokens expire in 1 hour

### API Security
- Rate limiting: 100 requests per 15 minutes per IP
- CORS configured for frontend domain only
- Request validation using Joi schemas
- SQL injection prevention via Mongoose
- XSS protection with sanitized inputs

### Environment Security
```bash
# Set appropriate file permissions
chmod 600 .env

# Never commit .env files
echo ".env" >> .gitignore
```

### Production Security Checklist
- [ ] Use HTTPS for all communications
- [ ] Set secure JWT secret (32+ characters)
- [ ] Configure MongoDB authentication
- [ ] Enable MongoDB encryption at rest
- [ ] Set up proper firewall rules
- [ ] Use environment-specific configurations
- [ ] Enable API logging and monitoring
- [ ] Configure backup strategies

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "user": {
    "id": "user_id",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": false
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "isVerified": true
  }
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

### Problem Endpoints

#### Get Daily Problem
```http
GET /api/problems/daily
Authorization: Bearer your-jwt-token
```

**Response (200)**
```json
{
  "success": true,
  "problem": {
    "id": "problem_id",
    "title": "Two Sum",
    "description": "Given an array of integers...",
    "difficulty": "Easy",
    "tags": ["Array", "Hash Table"],
    "examples": [...],
    "constraints": [...],
    "testCases": [...]
  }
}
```

#### Submit Solution
```http
POST /api/problems/:problemId/submit
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript"
}
```

### User Profile Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer your-jwt-token
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Software Developer passionate about algorithms"
}
```

#### Upload Profile Photo
```http
POST /api/users/profile/photo
Authorization: Bearer your-jwt-token
Content-Type: multipart/form-data

photo: [file]
```

### Analytics Endpoints

#### Get User Statistics
```http
GET /api/analytics/stats
Authorization: Bearer your-jwt-token
```

#### Get Performance Analytics
```http
GET /api/analytics/performance
Authorization: Bearer your-jwt-token
```

### Error Response Format
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "field": "email",
    "message": "Please enter a valid email address"
  },
  "code": "VALIDATION_ERROR"
}
```

---

## 🎨 User Interface Guide

### Dashboard Overview
The main dashboard provides:
- **Progress Overview**: Visual representation of learning progress
- **Quick Actions**: Access to daily challenges and recent problems
- **Skill Metrics**: Current skill levels and improvement suggestions
- **Achievement Gallery**: Earned badges and certificates

### Code Editor Features
- **Multi-language Support**: Syntax highlighting for 15+ programming languages
- **Intelligent Autocomplete**: Context-aware code suggestions
- **Real-time Error Detection**: Immediate feedback on syntax errors
- **Customizable Themes**: Dark/Light mode with multiple color schemes
- **Split View**: Problem description alongside code editor

### Problem Solving Interface
- **Problem Statement**: Clear, formatted problem descriptions
- **Example Test Cases**: Input/output examples with explanations
- **Custom Test Cases**: Create and run your own test scenarios
- **Submission History**: Track all attempts and solutions
- **Discussion Forum**: Community solutions and explanations

### Progress Tracking
- **Skill Assessment**: Interactive evaluation of programming abilities
- **Learning Path**: Personalized roadmap based on current skill level
- **Achievement System**: Unlock badges for various milestones
- **Performance Charts**: Visual analytics of solving patterns

---

## 🧪 Testing

### Running Tests

#### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Test coverage report
```

#### Frontend Tests
```bash
cd frontend
npm test                   # Run all tests
npm run test:unit         # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report
```

### Test Structure

#### Backend Test Categories
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: MongoDB operations
- **Authentication Tests**: JWT and security features

#### Frontend Test Categories
- **Component Tests**: React component rendering
- **Integration Tests**: User interaction flows
- **E2E Tests**: Complete user journeys
- **Performance Tests**: Load time and responsiveness

### Manual Testing Checklist

#### Authentication Flow
- [ ] User registration with email verification
- [ ] Login with valid/invalid credentials
- [ ] Password reset functionality
- [ ] Token expiration handling
- [ ] Role-based access control

#### Code Execution
- [ ] Multi-language code submission
- [ ] Test case validation
- [ ] Error handling for invalid code
- [ ] Performance metrics tracking
- [ ] Security isolation verification

#### User Experience
- [ ] Responsive design on mobile/tablet
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Cross-browser compatibility
- [ ] Loading states and error messages
- [ ] Data persistence across sessions

---

## 📦 Deployment

### Production Environment Setup

#### Environment Variables for Production
```env
# Production Database
MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/production"
NODE_ENV="production"

# Security Keys (Generate new ones for production)
JWT_SECRET="your-production-jwt-secret-256-bits"

# Production URLs
FRONTEND_URL="https://your-domain.com"
BACKEND_URL="https://api.your-domain.com"

# Email Configuration
EMAIL_USER="noreply@your-domain.com"
EMAIL_PASS="production-app-password"

# API Keys (Production)
JUDGE0_API_KEY="production-judge0-key"
OPENAI_API_KEY="production-openai-key"
IMAGEKIT_PRIVATE_KEY="production-imagekit-key"
```

### Deployment Options

#### Option 1: Traditional VPS/Server
```bash
# 1. Server Setup (Ubuntu 20.04+)
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm nginx certbot python3-certbot-nginx

# 2. Application Setup
git clone https://github.com/SamratPandey/ByteRunners.git
cd ByteRunners

# 3. Backend Deployment
cd backend
npm ci --production
npm install -g pm2
pm2 start app.js --name "byterunners-api"
pm2 startup
pm2 save

# 4. Frontend Build
cd ../frontend
npm ci
npm run build

# 5. Nginx Configuration
sudo cp nginx.conf /etc/nginx/sites-available/byterunners
sudo ln -s /etc/nginx/sites-available/byterunners /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. SSL Certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

#### Option 2: Docker Deployment
```dockerfile
# Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password

volumes:
  mongodb_data:
```

#### Option 3: Cloud Platform Deployment

**Vercel (Frontend)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

**Railway/Render (Backend)**
```bash
# Connect repository to Railway/Render
# Set environment variables in dashboard
# Auto-deploy on git push
```

**MongoDB Atlas (Database)**
- Use managed MongoDB service
- Configure network access
- Set up monitoring and backups

### Performance Optimization

#### Backend Optimization
```javascript
// Enable compression
app.use(compression());

// Cache static assets
app.use(express.static('public', {
  maxAge: '1y',
  etag: false
}));

// Database connection pooling
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000
});
```

#### Frontend Optimization
```javascript
// Lazy loading for routes
const Dashboard = lazy(() => import('./components/Dashboard'));
const Problems = lazy(() => import('./components/Problems'));

// Bundle analysis
npm run build -- --analyze
```

### Monitoring and Logging

#### Application Monitoring
```javascript
// Logger setup (winston)
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### Backend Issues

**Issue: MongoDB Connection Failed**
```bash
Error: MongoNetworkError: failed to connect to server
```
**Solution:**
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check connection string format
- Verify network access in MongoDB Atlas
- Ensure IP address is whitelisted

**Issue: JWT Authentication Fails**
```bash
Error: JsonWebTokenError: invalid signature
```
**Solution:**
- Verify JWT_SECRET is identical across environments
- Check token expiration
- Ensure token is passed in Authorization header
- Verify token format: `Bearer <token>`

**Issue: Email Service Not Working**
```bash
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution:**
- Enable 2FA on Gmail and use App Password
- Verify EMAIL_USER and EMAIL_PASS in .env
- Check SMTP settings for your email provider
- Test with different email service (SendGrid, Mailgun)

#### Frontend Issues

**Issue: CORS Error**
```bash
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Verify FRONTEND_URL in backend .env
- Check CORS configuration in backend
- Ensure API calls use correct backend URL
- Clear browser cache and cookies

**Issue: Build Errors**
```bash
Error: Cannot resolve module
```
**Solution:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Verify all dependencies in package.json
- Check for conflicting package versions
- Update to latest stable versions

**Issue: Monaco Editor Not Loading**
```bash
Error: Failed to load monaco editor
```
**Solution:**
- Check internet connection for CDN resources
- Verify monaco-editor package installation
- Clear browser cache
- Try different browser

#### Database Issues

**Issue: Slow Query Performance**
**Solution:**
- Add database indexes for frequently queried fields
- Use MongoDB Compass to analyze query performance
- Implement query optimization
- Consider database sharding for large datasets

**Issue: Data Migration Problems**
**Solution:**
- Backup database before migrations
- Use MongoDB migration scripts
- Test migrations on development environment first
- Implement rollback procedures

### Debug Mode

#### Enable Debug Logging
```bash
# Backend debug mode
DEBUG=app:* npm run dev

# Frontend debug mode
VITE_DEBUG=true npm run dev
```

#### Database Query Debugging
```javascript
// Enable Mongoose debug mode
mongoose.set('debug', true);
```

### Performance Issues

#### Backend Performance
- Use MongoDB aggregation pipelines for complex queries
- Implement Redis caching for frequently accessed data
- Enable gzip compression
- Use PM2 clustering for load balancing

#### Frontend Performance
- Implement lazy loading for components
- Use React.memo for component optimization
- Optimize bundle size with code splitting
- Enable service worker for caching

### Getting Help

1. **Check Console Logs**: Browser DevTools and server logs
2. **Review Documentation**: API endpoints and configuration
3. **Search Issues**: GitHub repository issues
4. **Community Support**: Create new issue with details
5. **Debug Information**: Include error messages, environment details, and steps to reproduce

---

## 🤝 Contributing

We welcome contributions from the community! ByteRunners is built by developers, for developers.

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/ByteRunners.git
   cd ByteRunners
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   cd backend && npm install
   cd ../frontend && npm install
   
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

### Development Workflow

#### Code Standards
- **ESLint**: Follow configured linting rules
- **Prettier**: Code formatting with 2-space indentation
- **TypeScript**: Gradual migration to TypeScript preferred
- **Naming Conventions**: camelCase for variables, PascalCase for components

#### Commit Guidelines
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat: add user skill assessment feature
fix: resolve JWT token expiration issue
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add unit tests for auth service
```

#### Pull Request Process
1. **Update Documentation**: Ensure README and API docs are current
2. **Add Tests**: Include unit/integration tests for new features
3. **Check CI/CD**: Ensure all automated tests pass
4. **Request Review**: Assign reviewers and await approval
5. **Address Feedback**: Make requested changes promptly

### Contribution Areas

#### 🚀 High Priority
- **Performance Optimization**: Database queries, frontend rendering
- **Security Enhancements**: Authentication, input validation
- **Mobile Responsiveness**: Touch-friendly interfaces
- **Accessibility**: WCAG 2.1 compliance improvements
- **Test Coverage**: Increase automated test coverage

#### 🔧 Feature Requests
- **New Programming Languages**: Additional language support
- **AI Enhancements**: Improved personalization algorithms
- **Social Features**: User collaboration and mentoring
- **Analytics Dashboard**: Advanced progress tracking
- **API Extensions**: Additional endpoint functionality

#### 🐛 Bug Reports
When reporting bugs, include:
- **Environment Details**: OS, browser, Node.js version
- **Steps to Reproduce**: Clear reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots/Logs**: Visual evidence and error messages

### Code Review Guidelines

#### For Contributors
- **Small, Focused PRs**: Keep changes manageable
- **Clear Descriptions**: Explain what and why
- **Self-Review**: Review your own code first
- **Testing**: Verify changes work as expected

#### For Reviewers
- **Constructive Feedback**: Focus on code, not person
- **Security Focus**: Watch for potential vulnerabilities
- **Performance Impact**: Consider scalability implications
- **User Experience**: Evaluate from user perspective

### Recognition

Contributors will be:
- **Listed in Contributors**: GitHub contributors list
- **Credited in Releases**: Mention in release notes
- **Badge Recipients**: Special contributor badges in app
- **Early Access**: Preview new features before release

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No liability or warranty provided

### Attribution
When using ByteRunners in your projects:
```text
ByteRunners - AI-Powered Coding Platform
Original work by Samrat Pandey and contributors
https://github.com/SamratPandey/ByteRunners
```

---

## 📞 Support & Contact

### 🆘 Getting Help
- **Documentation**: Check this comprehensive README first
- **GitHub Issues**: [Create an issue](https://github.com/SamratPandey/ByteRunners/issues) for bugs or feature requests
- **Discussions**: [GitHub Discussions](https://github.com/SamratPandey/ByteRunners/discussions) for questions and ideas

### 🔗 Links
- **Live Demo**: [ByteRunners Platform](https://byterunners.vercel.app) *(if deployed)*
- **API Documentation**: [Postman Collection](docs/api-collection.json)
- **Video Tutorials**: [YouTube Playlist](https://youtube.com/playlist?list=...) *(if available)*

### 👨‍💻 Author
**Samrat Pandey**
- GitHub: [@SamratPandey](https://github.com/SamratPandey)
- LinkedIn: [Samrat Pandey](https://linkedin.com/in/samrat-pandey)
- Email: samratpandeyofficial@gmail.com

---

<div align="center">

### 🚀 Ready to start your coding journey?

**[Get Started Now](#-quick-start)** | **[View Demo](#)** | **[Join Community](#-support--contact)**

*Made with ❤️ by developers, for developers*

</div>

