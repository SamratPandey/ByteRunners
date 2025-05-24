// This controller handles code execution for public users
const { executeCode } = require('../utils/judge0');

// Run code for public users without authentication
exports.runCodePublic = async (req, res) => {
  try {
    const { source_code, language, stdin } = req.body;

    if (!source_code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Source code and language are required',
      });
    }

    // Add rate limiting or other protections if needed for public endpoint
    // This is just a basic implementation

    // Execute the code using the Judge0 API
    const result = await executeCode(source_code, language, stdin);

    // Return the result
    return res.json({
      success: true,
      output: result.stdout || result.stderr || 'No output',
      error: result.stderr || null,
      execution_time: result.time || null,
    });
  } catch (error) {
    console.error('Error executing code:', error);
    return res.status(500).json({
      success: false,
      message: 'Error executing code',
      error: error.message,
    });
  }
};
