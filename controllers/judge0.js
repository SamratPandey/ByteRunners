const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

/**
 * Execute code using the Judge0 API.
 * @param {string} source_code - The source code to be executed.
 * @param {number} language_id - The language ID for the code.
 * @param {string} stdin - Optional standard input for the program.
 * @returns {object} - The result of the code execution from Judge0.
 */
const executeCode = async (source_code, language_id, stdin) => {
  const url = `${JUDGE0_API_URL}/submissions?base64_encoded=false`;
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': JUDGE0_API_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      language_id,
      source_code,
      stdin,
    }),
  };

  try {
    // Submit the code
    const response = await fetch(url, options);
    const { token } = await response.json();

    // Fetch the result using the token
    const resultResponse = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': JUDGE0_API_KEY,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      },
    });

    const result = await resultResponse.json();
    return result;
  } catch (error) {
    console.error('Error with Judge0 API:', error.message);
    throw new Error('Failed to execute code.');
  }
};

module.exports = { executeCode };
