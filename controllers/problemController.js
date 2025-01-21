const Problem = require('../models/Problem');
const User = require('../models/User');

// Controller to fetch problems and statistics
const getProblemResponse = async (req, res) => {
  try {
    // Fetch all problems
    const problems = await Problem.find();

    // Check if user is logged in
    if (!req.user) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    // Fetch user statistics, assuming the user is authenticated and we have userID in the request
    const userId = req.user._id;  // Assuming authentication middleware sets req.user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate statistics based on user's solved problems
    const solvedProblems = user.solvedProblems;
    const stats = {
      totalSolved: solvedProblems.length,
      easySolved: solvedProblems.filter(id => problems.find(p => p._id.toString() === id.toString() && p.difficulty === 'Easy')).length,
      mediumSolved: solvedProblems.filter(id => problems.find(p => p._id.toString() === id.toString() && p.difficulty === 'Medium')).length,
      hardSolved: solvedProblems.filter(id => problems.find(p => p._id.toString() === id.toString() && p.difficulty === 'Hard')).length,
      totalProblems: problems.length,
      easyTotal: problems.filter(p => p.difficulty === 'Easy').length,
      mediumTotal: problems.filter(p => p.difficulty === 'Medium').length,
      hardTotal: problems.filter(p => p.difficulty === 'Hard').length,
    };

    // Map over the problems to return them in the required format
    const problemData = problems.map(problem => ({
      _id: problem._id,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
      solved: solvedProblems.includes(problem._id.toString()),
      premium: problem.premium || false,
      acceptanceRate: problem.acceptanceRate || 0,  
      companies: problem.companies || [],  
    }));

    // Return the response
    res.status(200).json({
      problems: problemData,
      stats,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProblemResponse };
