import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Split from 'react-split';
import { Button } from "@/components/ui/button";
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';

const IDELayout = () => {
  const { id } = useParams(); // Access the problem ID from the URL
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const navigate = useNavigate();

  // Fetch problem details from the backend
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.BACKEND_URL}/api/problems/${id}`);
        setProblem(response.data);
      } catch (err) {
        setError('Unable to fetch problem details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]); // Fetch problem data when the problem ID changes

  const handleRun = async () => {
    setRunning(true);
    setOutput("");

    try {
      const response = await axios.post(`${import.meta.env.BACKEND_URL}/api/auth/run-code`, {
        source_code: code,
        language_id: 63, 
        stdin: problem?.exampleInput || "", 
      });

      setOutput(response.data.output || "No output received.");
    } catch (err) {
      setOutput("An error occurred while running the code.");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    const userId = 'user-id'; 

    try {
      const response = await axios.post(`${import.meta.env.BACKEND_URL}/api/auth/submit`, {
        userId,
        problemId: id,
        code,
      });

      if (response.data.status === 'solved') {
        setSolved(true);
        alert("Congratulations! You solved the problem!");
      } else {
        setSolved(false);
        alert("Incorrect solution. Try again.");
      }
    } catch (err) {
      console.error('Error submitting the solution:', err);
      alert('There was an error submitting your solution.');
    }
  };

  return (
    <div className="h-screen">
      <Split sizes={[50, 50]} minSize={200} direction="horizontal" className="flex">
        {/* Problem Section */}
        <div className="p-6 overflow-y-auto bg-gray-900 text-white">
          {loading ? (
            <p>Loading problem...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-green-400 mb-4">{problem.title}</h2>
              <p className="mb-6">{problem.description}</p>
              <h3 className="text-xl font-semibold mb-2">Input Format:</h3>
              <p className="mb-4">{problem.inputFormat}</p>
              <h3 className="text-xl font-semibold mb-2">Output Format:</h3>
              <p className="mb-4">{problem.outputFormat}</p>
              <h3 className="text-xl font-semibold mb-2">Constraints:</h3>
              <ul className="list-disc pl-5 mb-6">
                {problem.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
              <h3 className="text-xl font-semibold mb-2">Example:</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded">
{`Input:
${problem.exampleInput}
Output:
${problem.exampleOutput}`}
              </pre>
            </>
          )}
        </div>

        {/* IDE Section */}
        <div className="flex flex-col h-full bg-gray-800">
          <div className="flex-grow">
            <MonacoEditor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
            />
          </div>
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-4 mb-4">
              <Button variant="default" onClick={handleRun} disabled={running}>
                {running ? "Running..." : "Run"}
              </Button>
              <Button variant="default" onClick={handleSubmit} disabled={running || solved}>
                {solved ? "Solved!" : "Submit"}
              </Button>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Output:</h4>
              <pre className="bg-gray-700 text-green-400 p-4 rounded">
                {output || "// Output will appear here"}
              </pre>
            </div>
          </div>
        </div>
      </Split>
    </div>
  );
};

export default IDELayout;
