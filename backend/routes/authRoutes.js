const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getDashboardData,
  getUserProfile,
} = require("../controllers/authController");
const { executeCode } = require("../utils/judge0");
const { protect } = require("../middleware/auth");
const { getProblemById } = require("../controllers/problemController");
const LANGUAGE_MAP = require("../utils/languageMap");
const { logoutUser } = require("../controllers/tempLogoutUser");
const sendEmail = require("../controllers/sendMail"); // Add this import
const router = express.Router();
const User = require("../models/User");
const Problem = require("../models/Problem");
const {
  updateProfile,
  updateAvatar,
} = require("../controllers/userProfileController");
const { createAchievementNotification } = require("../controllers/notificationController");
const multer = require("multer");
const path = require("path");
const { checkAuth } = require("../controllers/tempCheckAuth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/run-code", async (req, res) => {
  const { source_code, language, stdin = "", problemId = null } = req.body;

  if (!source_code || !language) {
    return res
      .status(400)
      .json({ error: "Source code and language are required." });
  }

  const language_id = LANGUAGE_MAP[language.toLowerCase()];
  if (!language_id) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  try {
    // If problemId is provided, run against visible test cases
    if (problemId) {
      const problem = await Problem.findById(problemId);
      if (problem) {
        const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);
        if (visibleTestCases.length > 0) {
          const testResults = [];
          
          for (let i = 0; i < Math.min(visibleTestCases.length, 3); i++) { // Limit to first 3 visible test cases
            const testCase = visibleTestCases[i];
            try {
              const result = await executeCode(source_code, language_id, testCase.input);
              const userOutput = result.stdout?.trim() || '';
              const expectedOutput = testCase.output?.trim() || '';
              const passed = result.status?.id === 3 && userOutput === expectedOutput;
              
              testResults.push({
                testNumber: i + 1,
                passed,
                input: testCase.input,
                expectedOutput,
                userOutput,
                executionTime: result.time,
                memory: result.memory,
                status: result.status?.description || 'Unknown'
              });
            } catch (testError) {
              testResults.push({
                testNumber: i + 1,
                passed: false,
                input: testCase.input,
                expectedOutput: testCase.output,
                userOutput: 'Execution Error',
                executionTime: null,
                memory: null,
                status: 'Runtime Error',
                error: testError.message
              });
            }
          }
          
          return res.status(200).json({ 
            success: true, 
            type: 'testCases',
            testResults,
            totalVisible: visibleTestCases.length
          });
        }
      }
    }

    // Fallback to regular execution with provided stdin
    const result = await executeCode(source_code, language_id, stdin);
    const success = result.status?.id === 3;

    res.status(200).json({ success, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message || "Code execution failed." });
  }
});

router.post("/submit", protect, async (req, res) => {
  const { problemId, code, language } = req.body;
  const userId = req.user.id;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required." });
  }

  const language_id = LANGUAGE_MAP[language.toLowerCase()];
  if (!language_id) {
    return res.status(400).json({ error: "Unsupported language submitted." });
  }

  try {
    const user = await User.findById(userId);
    const problem = await Problem.findById(problemId);

    if (!user || !problem) {
      return res.status(404).json({ error: "User or problem not found." });
    }

    // Check if problem already solved
    const alreadySolved = user.solvedProblems.some(
      solved => solved.problemId.toString() === problemId
    );

    // Execute code against all test cases
    const testResults = [];
    let passedCount = 0;
    let totalTests = problem.testCases.length;
    
    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      
      try {
        const result = await executeCode(code, language_id, testCase.input);
        const userOutput = result.stdout?.trim() || '';
        const expectedOutput = testCase.output?.trim() || '';
        const passed = result.status?.id === 3 && userOutput === expectedOutput;
        
        if (passed) passedCount++;
        
        testResults.push({
          testNumber: i + 1,
          passed,
          input: testCase.isHidden ? '[Hidden]' : testCase.input,
          expectedOutput: testCase.isHidden ? '[Hidden]' : expectedOutput,
          userOutput: testCase.isHidden && !passed ? '[Hidden]' : userOutput,
          executionTime: result.time,
          memory: result.memory,
          isHidden: testCase.isHidden,
          status: result.status?.description || 'Unknown',
          stderr: result.stderr
        });
      } catch (testError) {
        testResults.push({
          testNumber: i + 1,
          passed: false,
          input: testCase.isHidden ? '[Hidden]' : testCase.input,
          expectedOutput: testCase.isHidden ? '[Hidden]' : testCase.output,
          userOutput: 'Execution Error',
          executionTime: null,
          memory: null,
          isHidden: testCase.isHidden,
          status: 'Runtime Error',
          stderr: testError.message
        });
      }
    }

    const allTestsPassed = passedCount === totalTests;
    const submissionStatus = allTestsPassed ? 'Accepted' : 'Wrong Answer';
    
    // Update user statistics
    user.totalSubmissions += 1;
    
    // Calculate new accuracy
    const newAccuracy = user.totalSubmissions > 0 
      ? ((user.problemsSolved + (allTestsPassed ? 1 : 0)) / user.totalSubmissions * 100).toFixed(1)
      : 0;
    user.accuracy = parseFloat(newAccuracy);
    
    // Add to recent activity
    user.recentActivity.unshift({
      problemId: problem._id,
      problemTitle: problem.title,
      status: submissionStatus,
      language: language,
      executionTime: testResults[0]?.executionTime || null,
      memoryUsed: testResults[0]?.memory || null,
      timestamp: new Date()
    });
    
    // Keep only last 20 activities
    if (user.recentActivity.length > 20) {
      user.recentActivity = user.recentActivity.slice(0, 20);
    }

    // If all tests passed and not previously solved
    if (allTestsPassed && !alreadySolved) {
      user.solvedProblems.push({
        problemId: problem._id,
        solvedAt: new Date(),
        attempts: 1
      });
      user.problemsSolved += 1;
      
      // Update streak logic
      const today = new Date().toDateString();
      const lastActiveDate = user.lastActive ? user.lastActive.toDateString() : null;
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      if (lastActiveDate === yesterday) {
        user.streak += 1;
      } else if (lastActiveDate !== today) {
        user.streak = 1;
      }
        // Award points based on difficulty
      const difficultyPoints = {
        'Easy': 10,
        'Medium': 25,
        'Hard': 50
      };
      const pointsAwarded = difficultyPoints[problem.difficulty] || 10;
      user.score += pointsAwarded;

      // Create achievement notification
      try {
        await createAchievementNotification(userId, problem.title, pointsAwarded);
      } catch (notificationError) {
        console.error('Error creating achievement notification:', notificationError);
        // Don't fail the submission if notification creation fails
      }
    } else if (alreadySolved) {
      // Update attempts for already solved problem
      const solvedProblem = user.solvedProblems.find(
        solved => solved.problemId.toString() === problemId
      );
      if (solvedProblem) {
        solvedProblem.attempts += 1;
      }
    }
    
    user.lastActive = new Date();
    await user.save();

    // Update problem statistics
    problem.totalSubmissions += 1;
    if (allTestsPassed && !alreadySolved) {
      problem.acceptedSubmissions += 1;
    }
    await problem.save();

    // Return detailed results
    const response = {
      status: allTestsPassed ? "solved" : "failed",
      message: allTestsPassed 
        ? (alreadySolved ? "Problem solved again! Great practice!" : "🎉 Congratulations! Problem solved!")
        : `${passedCount}/${totalTests} test cases passed`,
      testResults: {
        passed: passedCount,
        total: totalTests,
        details: testResults
      },
      alreadySolved,
      userStats: {
        problemsSolved: user.problemsSolved,
        totalSubmissions: user.totalSubmissions,
        accuracy: user.accuracy,
        streak: user.streak,
        score: user.score
      }
    };

    return res.status(200).json(response);

  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: "Server error during submission." });
  }
});

router.get("/dashboard", protect, getDashboardData);
router.get("/profile", protect, getUserProfile);
router.get("/problem/:id", protect, getProblemById);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/avatars/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
  fileFilter: fileFilter,
});

router.put("/update-profile", protect, updateProfile);
router.post("/update-avatar", protect, upload.single("avatar"), updateAvatar);

router.get("/check-auth", protect, checkAuth);

// Test email endpoint for debugging
router.post("/test-email", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  
  try {
    console.log("Testing email functionality...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
    
    await sendEmail(
      email,
      "Test Email from ByteRunners",
      "This is a test email to verify the mailing system is working correctly. If you received this, the email system is functioning properly!"
    );
    
    res.status(200).json({ message: "Test email sent successfully!" });
  } catch (error) {
    console.error("Test email failed:", error);
    res.status(500).json({ 
      error: "Failed to send test email", 
      details: error.message 
    });
  }
});

module.exports = router;
