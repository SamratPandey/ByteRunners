const fetch = require('node-fetch');
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Function to execute code
const executeCode = async (source_code, language_id, stdin = '') => {
  if (!JUDGE0_API_KEY) {
    throw new Error('JUDGE0_API_KEY is not configured');
  }

  const url = `${JUDGE0_API_URL}/submissions`;
  const options = {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_code,
      language_id,
      stdin,
      expected_output: null,
      cpu_time_limit: 2,
      memory_limit: 128000,
    }),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Submission Response:', data);

    if (!data.token) {
      throw new Error('No token received from Judge0');
    }

    const result = await pollSubmissionResult(data.token);
    console.log('Final Result:', result);
    return result;

  } catch (error) {
    console.error('Error with Judge0 API:', error);
    throw error;
  }
};

// Function to poll the result
const pollSubmissionResult = async (token) => {
  const maxRetries = 10;
  const retryDelay = 2000; // 2 seconds
  
  for (let retries = 0; retries < maxRetries; retries++) {
    try {
      const response = await fetch(`${JUDGE0_API_URL}/submissions/${token}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Poll attempt ${retries + 1}:`, result);

      // Check if the submission is finished
      if (result.status) {
        switch (result.status.id) {
          case 1: // In Queue
          case 2: // Processing
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          case 3: // Accepted
            return {
              status: result.status,
              stdout: result.stdout,
              stderr: result.stderr,
              compile_output: result.compile_output,
              time: result.time,
              memory: result.memory
            };
          default:
            // Any other status (error, runtime error, etc.)
            return result;
        }
      }
    } catch (error) {
      console.error(`Poll attempt ${retries + 1} failed:`, error);
      if (retries === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error('Maximum polling attempts reached');
};

module.exports = { executeCode };