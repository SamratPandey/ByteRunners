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
const router = express.Router();
const User = require("../models/User");
const Problem = require("../models/Problem");
const {
  updateProfile,
  updateAvatar,
} = require("../controllers/userProfileController");
const multer = require("multer");
const path = require("path");
const { checkAuth } = require("../controllers/tempCheckAuth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/run-code", async (req, res) => {
  const { source_code, language, stdin = "" } = req.body;

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
    const result = await executeCode(source_code, language_id, stdin);
    const success = result.status?.id === 3;

    res.status(200).json({ success, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message || "Code execution failed." });
  }
});

router.post("/submit", protect, async (req, res) => {
  const { userId, problemId, code, language, stdin = "" } = req.body;

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

    if (user.solvedProblems.includes(problemId)) {
      return res.status(400).json({ error: "Problem already solved." });
    }

    const result = await executeCode(code, language_id, stdin);
    const output = result.stdout?.trim();
    const expected = problem.expectedOutput?.trim();

    const isSolved = result.status?.id === 3 && output === expected;

    user.totalSubmissions += 1;
    if (isSolved) {
      user.solvedProblems.push(problemId);
      user.problemsSolved += 1;
      await user.save();
      return res
        .status(200)
        .json({ status: "solved", message: "Problem solved!" });
    }

    await user.save();
    res.status(400).json({ status: "failed", message: "Incorrect solution." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
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

module.exports = router;
