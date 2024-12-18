const Problem = require('../models/Problem');

// Get problem details by ID
const getProblemDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    res.status(200).json(problem);
  } catch (error) {
    console.error('Error fetching problem details:', error.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

module.exports = { getProblemDetails };
