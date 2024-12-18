# ByteRunners - A Web Application for Coder 

## Description

This is a web application built for a coding platform that allows users to sign up, log in, solve daily coding problems, and test code execution in a sandbox environment. The application includes user authentication, password reset functionality, and integrates a code execution environment using third-party services.

## Features

- **User Authentication**:
  - **Sign Up**: Users can create a new account.
  - **Login**: Existing users can log in.
  - **Password Reset**: Users can reset their password via email.

- **Daily Coding Problems**:
  - Display coding problems for users to solve daily.
  - Provides a user-friendly interface for viewing and solving problems.

- **Code Execution Environment**:
  - Integration with a third-party provider for code execution.
  - Users can run their code and see results in real-time.

- **User Dashboard**:
  - Displays user-specific information like solved problems and progress.

- **Responsive Design**:
  - Fully responsive UI using **Tailwind CSS** and **ShadCN UI** components.

---

## Setup and Installation

### Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/SamratPandey/noName.git
```

### Backend Setup

1. Navigate to the **backend** directory:
```bash
   cd backend
```

2. Install the required **dependencies**:

```bash
npm install
```

3. Create a **.env** file and add the following environment variables:

```env
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
FRONTEND_URL=http://localhost:3000
MONGO_URI=your-mongodb-connection-uri
```

4. Run the **backend server**:
```bash
node server.js
```


### Frontend Setup

1. Navigate to the **frontend** directory:

```bash
cd frontend
```

2. Install the required **dependencies**:

```bash
npm install
```

3. Run the frontend development server:

```bash
npm run dev
```

### Testing

After both the backend and frontend are running, navigate to [http://localhost:3001] for backend and frontend on [http://localhost:5173] as shown on your terminal after npm run dev and open that link on your browser to access the web application.

**Make sure both your frontend and backend is running if not then might application might be crash.**

- You can register, log in, and access the daily problems page.
- The code execution environment is integrated and should work with third-party services.

### API Endpoints

#### Authentication Endpoints
- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/login**: Login an existing user and receive a JWT token.
- **POST /api/auth/forgot-password**: Request a password reset email.
- **POST /api/auth/reset-password**: Reset the user password using the reset token.

#### Problem Endpoints
- **GET /api/problems/daily**: Fetch the daily coding problem.

---

### Contributing

If you'd like to contribute to this project, please fork the repository and create a pull request with your changes.

1. **Fork the repository**
2. **Clone your fork** to your local machine
3. **Create a feature branch** (`git checkout -b feature/your-feature`)
4. **Commit your changes** (`git commit -am 'Add new feature'`)
5. **Push to your branch** (`git push origin feature/your-feature`)
6. **Create a pull request**

