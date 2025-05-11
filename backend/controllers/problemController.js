const Problem = require('../models/Problem');
const User = require('../models/User');

// Controller to fetch problems and statistics
const getProblemResponse = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.status(200).json({
      problems: problemData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.status(200).json(problem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { 
  getProblemResponse,
  getProblemById
 };
