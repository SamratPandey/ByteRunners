import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { Copy, Maximize2, Minimize2, X, Play, Pause, RotateCcw, Send, Settings, Save, FileText } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import Nav from './Nav';
import authApi from '../utils/authApi';
import { FormSkeleton } from './ui/skeleton';



const ProblemDetailsPanel = ({ problem, loading }) => {
  if (loading) {
    return (
      <div className="h-full w-full overflow-y-auto bg-black/90 text-gray-200 border-r border-green-800/70 p-4">
        <FormSkeleton />
      </div>
    );
  }

  if (!problem || Object.keys(problem).length === 0) {
    return (
      <div className="h-full w-full overflow-y-auto bg-black/90 text-gray-200 border-r border-green-800/70 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-2">No problem loaded</div>
          <div className="text-sm text-gray-500">Please check the problem ID and try again</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-black/90 text-gray-200 border-r border-green-800/70">
      <div className="p-4 border-b border-green-800/70">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-semibold text-green-400">{problem?.title || "Loading problem..."}</h1>
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            problem?.difficulty === 'Easy' ? 'bg-green-900/40 text-green-400' :
            problem?.difficulty === 'Medium' ? 'bg-yellow-900/40 text-yellow-400' :
            'bg-red-900/40 text-red-400'
          }`}>
            {problem?.difficulty || ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {problem?.tags?.map((tag, index) => (
            <span key={index} className="bg-green-900/30 border border-green-800/50 text-green-400 text-xs px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4 border-b border-green-800/70">
        <h2 className="text-sm uppercase tracking-wider text-green-500/80 mb-2">Description</h2>
        <div className="prose prose-sm prose-invert prose-green max-w-none">
          <p className="text-gray-300 whitespace-pre-wrap">{problem?.description}</p>
        </div>
      </div>
      <div className="p-4 border-b border-green-800/70">
        <h2 className="text-sm uppercase tracking-wider text-green-500/80 mb-2">Input Format</h2>
        <p className="text-gray-300 text-sm mb-4">{problem?.inputFormat}</p>
        
        <h2 className="text-sm uppercase tracking-wider text-green-500/80 mb-2">Output Format</h2>
        <p className="text-gray-300 text-sm">{problem?.outputFormat}</p>
      </div>
      <div className="p-4 border-b border-green-800/70">
        <h2 className="text-sm uppercase tracking-wider text-green-500/80 mb-2">Constraints</h2>
        <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap bg-black/30 p-2 rounded">
          {problem?.constraints}
        </pre>
      </div>
      
      <div className="p-4">
        <h2 className="text-sm uppercase tracking-wider text-green-500/80 mb-3">Examples</h2>
        
        {problem?.examples?.map((example, index) => (
          <div key={index} className="mb-6 last:mb-0">
            <div className="text-xs text-green-400 mb-1">Example {index + 1}</div>
            
            <div className="mb-3">
              <div className="text-xs text-green-500/80 mb-1">Input:</div>
              <pre className="bg-black/30 p-2 rounded text-sm font-mono text-gray-300">{example.input}</pre>
            </div>
            
            <div className="mb-3">
              <div className="text-xs text-green-500/80 mb-1">Output:</div>
              <pre className="bg-black/30 p-2 rounded text-sm font-mono text-gray-300">{example.output}</pre>
            </div>
            
            {example.explanation && (
              <div>
                <div className="text-xs text-green-500/80 mb-1">Explanation:</div>
                <p className="text-sm text-gray-300">{example.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const CodeEditorPanel = ({ 
    selectedLanguage, 
    code, 
    onCodeChange, 
    onLanguageChange,
    editorPosition,
    setEditorPosition,
    isFullscreen,
    toggleFullscreen,
    timerRef,
    timerRunningRef,
    timerDisplayRef,
    toggleTimer,
    resetTimer,
    problemId,
    autoSaveEnabled,
    setAutoSaveEnabled 
  }) => {
    const editorRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [output, setOutput] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [theme, setTheme] = useState('vs-dark');
    
    const handleEditorDidMount = (editor, monaco) => {
      editorRef.current = editor;
      
      editor.onDidChangeCursorPosition(e => {
        setEditorPosition({
          lineNumber: e.position.lineNumber,
          column: e.position.column
        });
      });

      // Add keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        manualSave();
      });
      
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        runCode();
      });
    };
    
    const copyCode = () => {
      navigator.clipboard.writeText(code);      toast.success('Code copied to clipboard! Ready to share or save.', {
        style: {
          background: '#22c55e',
          color: 'white',
          fontWeight: '500'
        },
        duration: 2000
      });
    };

    const manualSave = () => {
      if (problemId && code) {
        const saveKey = `problem_${problemId}_${selectedLanguage}`;
        localStorage.setItem(saveKey, code);        toast.success('Code saved successfully!', {
          style: {
            background: '#22c55e',
            color: 'white',
            fontWeight: '500'
          },
          duration: 1500
        });
      }
    };

    const resetCode = () => {
      if (window.confirm('Are you sure you want to reset your code? This will remove all your current work.')) {
        const defaultTemplates = {
          javascript: `// Write your JavaScript solution here\nfunction solution() {\n    // Your code here\n    \n    return result;\n}\n\n// Test your solution\nconsole.log("Hello World");`,
          python: `# Write your Python solution here\ndef solution():\n    \"\"\"\n    Your solution goes here\n    \"\"\"\n    # Your code here\n    \n    return result\n\n# Test your solution\nprint("Hello World")`,
          java: `// Write your Java solution here\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello World");\n    }\n    \n    // Add your solution methods here\n}`,
          cpp: `// Write your C++ solution here\n#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Your code here\n    cout << "Hello World" << endl;\n    return 0;\n}`
        };
        onCodeChange(defaultTemplates[selectedLanguage] || '// Start coding here');
        
        // Clear saved code
        if (problemId) {
          const saveKey = `problem_${problemId}_${selectedLanguage}`;
          localStorage.removeItem(saveKey);
        }
          toast.success('Code reset to default template', {
          style: {
            background: '#22c55e',
            color: 'white',
            fontWeight: '500'
          },
          duration: 2000
        });
      }
    };
        const runCode = async () => {
      if (!code.trim()) {
        toast.error('Please write some code first before running tests!', { 
          id: 'runCode',
          style: {
            background: '#ef4444',
            color: 'white',
            fontWeight: '500'
          },
          duration: 3000
        });
        return;
      }
      
      try {
        toast.loading('Running your code...', { id: 'runCode' });
        setIsRunning(true);
        
        const response = await authApi.post(
          '/api/auth/run-code',
          {
            source_code: code,
            language: selectedLanguage,
            problemId: problemId || null, // Include problemId for test case execution
            stdin: '' 
          }
        );
        
        setIsRunning(false);
        
        if (response.data.success) {
          // Check if we have test case results
          if (response.data.testResults && Array.isArray(response.data.testResults)) {
            const passedTests = response.data.testResults.filter(test => test.status === 'passed').length;
            const totalTests = response.data.testResults.length;
              toast.success(`${passedTests}/${totalTests} visible test cases passed!`, { 
              id: 'runCode',
              style: {
                background: '#22c55e',
                color: 'white',
                fontWeight: '500'
              },
              duration: 3000
            });
            
            setOutput({
              status: 'success',
              type: 'testResults',
              testResults: response.data.testResults,
              passedTests,
              totalTests
            });          } else {
            // Regular execution without test cases
            toast.success('Code executed successfully! Check the output below.', { 
              id: 'runCode',
              style: {
                background: '#22c55e',
                color: 'white',
                fontWeight: '500'
              },
              duration: 2000
            });
            setOutput({
              status: 'success',
              type: 'execution',
              stdout: response.data.stdout || 'No output',
              time: response.data.time,
              memory: response.data.memory
            });
          }
        } else {
          setOutput({
            status: 'error',
            type: 'execution',
            stderr: response.data.stderr || response.data.compile_output || 'Unknown error',
            error: response.data.message || 'Execution failed'
          });
        }      } catch (error) {
        setIsRunning(false);
        setOutput({
          status: 'error',
          type: 'execution',
          error: error.response?.data?.error || error.message || 'Network error'
        });
        toast.error('Failed to run code: ' + (error.response?.data?.error || error.message), { id: 'runCode' });
      }
    };    const submitCode = async () => {
      if (!code.trim()) {
        toast.error('Please write your solution code before submitting!', {
          style: {
            background: '#ef4444',
            color: 'white',
            fontWeight: '500'
          },
          duration: 3000
        });
        return;
      }
      
      setIsSubmitting(true);
      toast.loading('Submitting solution...', { id: 'submitCode' });
      
      try {
        const response = await authApi.post(
          '/api/auth/submit',
          {
            problemId,
            code,
            language: selectedLanguage
          }
        );
        
        setIsSubmitting(false);
        
        if (response.data.status === 'solved' || response.data.status === 'accepted') {
          toast.success(response.data.message, { id: 'submitCode', duration: 4000 });
          setOutput({
            status: 'success',
            type: 'submission',
            message: response.data.message,
            testResults: response.data.testResults || [],
            userStats: response.data.userStats,
            problemStats: response.data.problemStats,
            submission: {
              passedTests: response.data.passedTests || 0,
              totalTests: response.data.totalTests || 0,
              executionTime: response.data.executionTime,
              alreadySolved: response.data.alreadySolved || false
            }
          });
        } else {
          const failedMessage = response.data.message || 'Some test cases failed';
          toast.error(failedMessage, { id: 'submitCode', duration: 4000 });
          setOutput({
            status: 'error',
            type: 'submission',
            message: failedMessage,
            testResults: response.data.testResults || [],
            submission: {
              passedTests: response.data.passedTests || 0,
              totalTests: response.data.totalTests || 0,
              executionTime: response.data.executionTime
            }
          });
        }
      } catch (error) {
        setIsSubmitting(false);
        toast.error('Unable to submit your solution right now. Please try again in a moment.', { 
          id: 'submitCode',
          style: {
            background: '#ef4444',
            color: 'white',
            fontWeight: '500'
          },
          duration: 4000
        });
        setOutput({
          status: 'error',
          type: 'submission',
          error: error.response?.data?.error || error.message || 'Network error'
        });
      }
    };
    
    const languageMap = {
      'JavaScript': 'javascript',
      'Python': 'python',
      'Java': 'java',
      'C++': 'cpp'
    };
      const editorOptions = {
      minimap: { enabled: false },
      fontSize: fontSize,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      tabSize: 2,
      wordWrap: 'on',
      bracketPairColorization: { enabled: true },
      suggest: {
        enabled: true,
        showStatusBar: true
      },
      quickSuggestions: true,
      parameterHints: { enabled: true },
      hover: { enabled: true }
    };

    // Settings Panel Component
    const SettingsPanel = () => (
      showSettings && (
        <div className="absolute top-12 right-4 z-50 bg-black/95 border border-green-800/70 rounded-lg p-4 min-w-[280px] shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-green-400 font-medium">Editor Settings</h3>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-green-400"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Font Size</label>
              <input
                type="range"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-green-500"
              />
              <div className="text-xs text-gray-400 mt-1">{fontSize}px</div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-black/60 border border-green-800 text-green-400 px-2 py-1 rounded text-sm"
              >
                <option value="vs-dark">Dark</option>
                <option value="vs-light">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300">Auto Save</label>
              <button
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className={`px-3 py-1 text-xs rounded ${
                  autoSaveEnabled 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {autoSaveEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="border-t border-green-800/50 pt-3">
              <div className="text-xs text-gray-400 space-y-1">
                <div>• Ctrl+S: Save code</div>
                <div>• Ctrl+Enter: Run code</div>
                <div>• Auto-save: Every 2 seconds</div>
              </div>
            </div>
          </div>
        </div>
      )
    );
      return (
      <div className="flex flex-col h-full relative">
        <SettingsPanel />
        
        <div className="flex justify-between items-center bg-black/90 backdrop-blur-md border-b border-green-800/70 px-4 py-2">
          <div className="flex items-center space-x-4">
            <select 
              value={selectedLanguage}
              onChange={onLanguageChange}
              className="bg-black/60 border border-green-800 text-green-400 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent text-sm"
            >
              {Object.entries(languageMap).map(([label, value]) => (
                <option key={value} value={value} className="bg-black text-green-400">
                  {label}
                </option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleTimer}
                className="text-gray-400 hover:text-green-400 transition-colors text-xs bg-black/60 border border-green-800/50 px-2 py-1 rounded flex items-center space-x-1"
                title={timerRunningRef.current ? 'Pause timer' : 'Start timer'}
              >
                <span className="inline-block">
                  {timerRunningRef.current ? <Pause size={10} /> : <Play size={10} />}
                </span>
                <span>{timerRunningRef.current ? 'Pause' : 'Start'}</span>
              </button>
              
              <button 
                onClick={resetTimer}
                className="text-gray-400 hover:text-green-400 transition-colors text-xs bg-black/60 border border-green-800/50 px-2 py-1 rounded flex items-center space-x-1"
                title="Reset timer"
              >
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
              
              <span 
                ref={timerDisplayRef} 
                className="text-green-400 text-sm font-mono"
              >
                00:00:00
              </span>
            </div>

            {autoSaveEnabled && (
              <div className="text-xs text-green-500/70 flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Auto-save enabled</span>
              </div>
            )}
          </div>
            <div className="flex items-center space-x-3">            <button 
              onClick={runCode}
              disabled={isRunning}
              className={`text-gray-200 hover:text-black transition-colors text-xs ${
                isRunning ? 'bg-green-700/50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
              } border border-green-800/50 px-2 py-1 rounded flex items-center space-x-1`}
              title={problemId ? "Run against visible test cases (Ctrl+Enter)" : "Run code (Ctrl+Enter)"}
            >
              <Play size={10}/>
              <span>{isRunning ? 'Running...' : (problemId ? 'Run Tests' : 'Run')}</span>
            </button>
            
            <button 
              onClick={submitCode}
              disabled={isSubmitting}
              className={`text-gray-200 hover:text-black transition-colors text-xs ${
                isSubmitting ? 'bg-green-700/50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
              } border border-green-800/50 px-2 py-1 rounded flex items-center space-x-1`}
            >
              <Send size={10} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
            </button>

            <div className="h-4 w-px bg-green-800/50"></div>

            <button 
              onClick={manualSave}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-1 rounded-full hover:bg-green-900/30"
              aria-label="Save code (Ctrl+S)"
              title="Save code (Ctrl+S)"
            >
              <Save size={16} />
            </button>
  
            <button 
              onClick={copyCode}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-1 rounded-full hover:bg-green-900/30"
              aria-label="Copy code"
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </button>

            <button 
              onClick={resetCode}
              className="text-gray-400 hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-red-900/30"
              aria-label="Reset code"
              title="Reset to default template"
            >
              <FileText size={16} />
            </button>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`transition-colors duration-200 p-1 rounded-full ${
                showSettings 
                  ? 'text-green-400 bg-green-900/30' 
                  : 'text-gray-400 hover:text-green-400 hover:bg-green-900/30'
              }`}
              aria-label="Settings"
              title="Editor settings"
            >
              <Settings size={16} />
            </button>
            
            <button 
              onClick={toggleFullscreen}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-1 rounded-full hover:bg-green-900/30"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            
            {isFullscreen && (
              <button 
                onClick={toggleFullscreen}
                className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-1 rounded-full hover:bg-green-900/30"
                aria-label="Close"
                title="Close fullscreen"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-grow relative flex flex-col">          <div className={`${output ? 'h-3/5' : 'h-full'}`}>
            <Editor
              height="100%"
              theme={theme}
              language={selectedLanguage}
              value={code}
              onChange={onCodeChange}
              onMount={handleEditorDidMount}
              options={editorOptions}
            />
          </div>
            {output && (
            <div className="h-2/5 border-t border-green-800/70 bg-black/90 p-4 overflow-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-sm font-medium ${
                  output.status === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {output.type === 'testResults' ? 'Test Results' :
                   output.type === 'submission' ? 'Submission Results' : 
                   output.status === 'success' ? 'Output' : 'Error'}
                </h3>
                <button 
                  onClick={() => setOutput(null)}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                  aria-label="Close output"
                >
                  <X size={14} />
                </button>
              </div>
              
              {/* Test Results Display */}
              {output.type === 'testResults' && output.testResults && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-sm font-medium ${
                      output.passedTests === output.totalTests ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      Passed: {output.passedTests}/{output.totalTests} test cases
                    </div>
                    <div className="text-xs text-gray-400">
                      Visible test cases only
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {output.testResults.map((test, index) => (
                      <div key={index} className={`border rounded p-3 ${
                        test.status === 'passed' 
                          ? 'border-green-800/50 bg-green-900/10' 
                          : 'border-red-800/50 bg-red-900/10'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium ${
                            test.status === 'passed' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            Test Case {index + 1}: {test.status === 'passed' ? 'PASSED' : 'FAILED'}
                          </span>
                          {test.executionTime && (
                            <span className="text-xs text-gray-400">
                              {test.executionTime}ms
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <div className="text-gray-400 mb-1">Input:</div>
                            <pre className="bg-black/30 p-2 rounded font-mono text-gray-300 max-h-20 overflow-auto">
                              {test.input || 'No input'}
                            </pre>
                          </div>
                          
                          <div>
                            <div className="text-gray-400 mb-1">Expected:</div>
                            <pre className="bg-black/30 p-2 rounded font-mono text-gray-300 max-h-20 overflow-auto">
                              {test.expectedOutput || 'No expected output'}
                            </pre>
                          </div>
                          
                          <div>
                            <div className="text-gray-400 mb-1">Your Output:</div>
                            <pre className={`bg-black/30 p-2 rounded font-mono max-h-20 overflow-auto ${
                              test.status === 'passed' ? 'text-green-300' : 'text-red-300'
                            }`}>
                              {test.actualOutput || 'No output'}
                            </pre>
                          </div>
                        </div>
                        
                        {test.error && (
                          <div className="mt-2">
                            <div className="text-red-400 text-xs mb-1">Error:</div>
                            <pre className="bg-red-900/20 p-2 rounded text-xs font-mono text-red-300">
                              {test.error}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Submission Results Display */}
              {output.type === 'submission' && (
                <div className="space-y-4">
                  {output.message && (
                    <div className={`p-3 rounded border ${
                      output.status === 'success' 
                        ? 'bg-green-900/20 border-green-800/50 text-green-400' 
                        : 'bg-red-900/20 border-red-800/50 text-red-400'
                    }`}>
                      <div className="font-medium text-sm mb-1">
                        {output.status === 'success' ? '🎉 Congratulations!' : '❌ Submission Failed'}
                      </div>
                      <div className="text-sm">{output.message}</div>
                    </div>
                  )}
                  
                  {output.submission && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-black/30 p-3 rounded">
                        <div className="text-gray-400 mb-1">Test Cases</div>
                        <div className={`font-medium ${
                          output.submission.passedTests === output.submission.totalTests 
                            ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {output.submission.passedTests}/{output.submission.totalTests} passed
                        </div>
                      </div>
                      
                      {output.submission.executionTime && (
                        <div className="bg-black/30 p-3 rounded">
                          <div className="text-gray-400 mb-1">Execution Time</div>
                          <div className="text-green-400 font-medium">
                            {output.submission.executionTime}ms
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {output.userStats && (
                    <div className="border-t border-green-800/50 pt-3">
                      <div className="text-green-400 font-medium mb-2">📊 Your Progress</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-black/30 p-2 rounded text-center">
                          <div className="text-gray-400">Problems Solved</div>
                          <div className="text-green-400 font-bold text-lg">
                            {output.userStats.problemsSolved}
                          </div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-center">
                          <div className="text-gray-400">Accuracy</div>
                          <div className="text-green-400 font-bold text-lg">
                            {output.userStats.accuracy}%
                          </div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-center">
                          <div className="text-gray-400">Current Streak</div>
                          <div className="text-green-400 font-bold text-lg">
                            {output.userStats.currentStreak}
                          </div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-center">
                          <div className="text-gray-400">Score</div>
                          <div className="text-green-400 font-bold text-lg">
                            {output.userStats.score}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {output.submission?.alreadySolved && (
                    <div className="bg-blue-900/20 border border-blue-800/50 p-3 rounded">
                      <div className="text-blue-400 text-sm">
                        ℹYou've already solved this problem! This submission updates your attempt count.
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Regular Execution Output */}
              {output.type === 'execution' && output.status === 'success' && (
                <>
                  {output.stdout && (
                    <div className="mb-2">
                      <div className="text-xs text-green-500/80 mb-1">Standard Output:</div>
                      <pre className="bg-black/30 p-2 rounded text-sm font-mono text-gray-300 whitespace-pre-wrap">
                        {output.stdout}
                      </pre>
                    </div>
                  )}
                  
                  {output.message && (
                    <div className="mb-2">
                      <pre className="bg-green-900/20 p-2 rounded text-sm font-mono text-green-400 whitespace-pre-wrap">
                        {output.message}
                      </pre>
                    </div>
                  )}
                  
                  {(output.time !== undefined || output.memory !== undefined) && (
                    <div className="flex space-x-4 text-xs text-gray-400 mt-2">
                      {output.time !== undefined && <span>Time: {output.time} ms</span>}
                      {output.memory !== undefined && <span>Memory: {Math.round(output.memory / 1024)} KB</span>}
                    </div>
                  )}
                </>
              )}
              
              {/* Error Display */}
              {output.status === 'error' && (
                <>
                  {output.stderr && (
                    <div className="mb-2">
                      <div className="text-xs text-red-500/80 mb-1">Standard Error:</div>
                      <pre className="bg-black/30 p-2 rounded text-sm font-mono text-red-300 whitespace-pre-wrap">
                        {output.stderr}
                      </pre>
                    </div>
                  )}
                  
                  {output.error && (
                    <div className="mb-2">
                      <pre className="bg-red-900/20 p-2 rounded text-sm font-mono text-red-400 whitespace-pre-wrap">
                        {output.error}
                      </pre>
                    </div>
                  )}
                  
                  {output.message && (
                    <div className="mb-2">
                      <pre className="bg-red-900/20 p-2 rounded text-sm font-mono text-red-400 whitespace-pre-wrap">
                        {output.message}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center bg-black/90 backdrop-blur-md border-t border-green-800/70 px-4 py-2 text-xs text-gray-400">
          <div>
            {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
          </div>
          <div className="flex space-x-4">
            <span>Line: {editorPosition.lineNumber}</span>
            <span>Column: {editorPosition.column}</span>
          </div>
        </div>
      </div>
    );
  };

const Solve = () => {
    const [problem, setProblem] = useState({});
    const [loading, setLoading] = useState(true);
    const { problemId } = useParams();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('// Start coding here');
    const [editorPosition, setEditorPosition] = useState({ lineNumber: 1, column: 1 });
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
    const timerRef = useRef(0);
    const timerRunningRef = useRef(false);
    const timerDisplayRef = useRef(null);
    const timerIntervalRef = useRef(null);    const autoSaveTimeoutRef = useRef(null);

    const formatTime = (seconds) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Auto-save functionality
    const autoSaveCode = useCallback(() => {      if (autoSaveEnabled && problemId && code && code !== '// Start coding here') {
        const saveKey = `problem_${problemId}_${selectedLanguage}`;
        localStorage.setItem(saveKey, code);
      }
    }, [problemId, selectedLanguage, code, autoSaveEnabled]);

    // Load saved code
    const loadSavedCode = useCallback(() => {
      if (problemId) {
        const saveKey = `problem_${problemId}_${selectedLanguage}`;
        const savedCode = localStorage.getItem(saveKey);
        if (savedCode && savedCode !== '// Start coding here') {
          setCode(savedCode);
          toast.success('📁 Restored your previous work!', {
            style: {
              background: '#22c55e',
              color: 'white',
              fontWeight: '500'
            },
            duration: 2000
          });
          return true;
        }
      }
      return false;
    }, [problemId, selectedLanguage]);    useEffect(() => {
      const fetchProblem = async () => {
        if (!problemId) {
          setLoading(false);
          return;
        }        
        try {
          setLoading(true);
          
          // Check if user is authenticated first
          try {
            await authApi.get('/api/auth/check-auth');
          } catch (authError) {
            toast.error("Please log in to access problems.", {
              style: {
                background: '#ef4444',
                color: 'white',
                fontWeight: '500'
              },
              duration: 4000
            });
            setLoading(false);
            // Redirect to login page
            window.location.href = '/login';
            return;
          }          
          const response = await authApi.get(`/api/auth/problem/${problemId}`);

          if (!response.data) {
            toast.error("Problem not found. It may have been removed or you don't have access.", {
              style: {
                background: '#ef4444',
                color: 'white',
                fontWeight: '500'
              },
              duration: 4000
            });
            setLoading(false);
            return;
          }
  
          setProblem(response.data);
          
          // Try to load saved code first
          const hasSavedCode = loadSavedCode();
          
          if (!hasSavedCode) {
            // Set initial code template if available and no saved code
            if (response.data.codeTemplates && response.data.codeTemplates[selectedLanguage]) {
              setCode(response.data.codeTemplates[selectedLanguage]);
            } else {
              // Set enhanced default templates based on language
              const defaultTemplates = {
                javascript: `// ${response.data.title || 'Problem Solution'}\n// Write your JavaScript solution here\n\nfunction solution() {\n    // Your code here\n    \n    return result;\n}\n\n// Test your solution\nconsole.log("Hello World");`,
                python: `# ${response.data.title || 'Problem Solution'}\n# Write your Python solution here\n\ndef solution():\n    \"\"\"\n    Your solution goes here\n    \"\"\"\n    # Your code here\n    \n    return result\n\n# Test your solution\nprint("Hello World")`,
                java: `// ${response.data.title || 'Problem Solution'}\n// Write your Java solution here\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello World");\n    }\n    \n    // Add your solution methods here\n}`,
                cpp: `// ${response.data.title || 'Problem Solution'}\n// Write your C++ solution here\n\n#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Your code here\n    cout << "Hello World" << endl;\n    return 0;\n}`
              };
              setCode(defaultTemplates[selectedLanguage] || '// Start coding here');
            }
          }
          
          setLoading(false);        } catch (error) {
          let errorMessage = "Unable to load the problem. Please refresh the page or try again later.";
          
          if (error.response?.status === 401) {
            errorMessage = "Authentication expired. Please log in again.";
          } else if (error.response?.status === 404) {
            errorMessage = "Problem not found. It may have been removed.";
          } else if (error.response?.status === 403) {
            errorMessage = "You don't have permission to access this problem.";
          }
          
          toast.error(errorMessage, {
            style: {
              background: '#ef4444',
              color: 'white',
              fontWeight: '500'
            },
            duration: 4000
          });
          setLoading(false);
        }
      };
  
      fetchProblem();
    }, [problemId, selectedLanguage, loadSavedCode]);

    // Auto-save effect
    useEffect(() => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveCode();
      }, 2000); // Auto-save after 2 seconds of inactivity
      
      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
      };
    }, [code, autoSaveCode]);

    useEffect(() => {
      if (problem.codeTemplates && problem.codeTemplates[selectedLanguage]) {
        setCode(problem.codeTemplates[selectedLanguage]);
      }
    }, [selectedLanguage, problem]);
  
    useEffect(() => {
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }, []);
  
    const toggleFullscreen = useCallback(() => {
      setIsFullscreen(prev => !prev);
    }, []);
  
    const toggleTimer = useCallback(() => {
      if (timerRunningRef.current) {
        clearInterval(timerIntervalRef.current);
        timerRunningRef.current = false;
      } else {
        timerIntervalRef.current = setInterval(() => {
          timerRef.current += 1;
          if (timerDisplayRef.current) {
            timerDisplayRef.current.textContent = formatTime(timerRef.current);
          }
        }, 1000);
        timerRunningRef.current = true;
      }
    }, []);
  
    const resetTimer = useCallback(() => {
      clearInterval(timerIntervalRef.current);
      timerRef.current = 0;
      timerRunningRef.current = false;
      if (timerDisplayRef.current) {
        timerDisplayRef.current.textContent = formatTime(0);
      }
    }, []);
  

    const handleCodeChange = useCallback((value) => {
      setCode(value);
    }, []);
  

    const handleLanguageChange = useCallback((e) => {
      setSelectedLanguage(e.target.value);
    }, []);
    return (
      <>
        {!isFullscreen && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
            <Nav />
          </div>
        )}
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black/95' : 'relative w-full pt-20'}`}>{isFullscreen ? (
            <div className="h-full overflow-hidden shadow-lg shadow-green-900/20">
              <CodeEditorPanel
                selectedLanguage={selectedLanguage}
                code={code}
                onCodeChange={handleCodeChange}
                onLanguageChange={handleLanguageChange}
                editorPosition={editorPosition}
                setEditorPosition={setEditorPosition}
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                timerRef={timerRef}
                timerRunningRef={timerRunningRef}
                timerDisplayRef={timerDisplayRef}
                toggleTimer={toggleTimer}
                resetTimer={resetTimer}
                problemId={problemId}
                autoSaveEnabled={autoSaveEnabled}
                setAutoSaveEnabled={setAutoSaveEnabled}
              />
            </div>
          ) : (<ResizablePanelGroup direction="horizontal" className="max-w-full md:min-w-[450px]">
              <ResizablePanel className="overflow-hidden shadow-lg shadow-green-900/20">
                <div className="h-[102vh]">
                  <ProblemDetailsPanel problem={problem} loading={loading} />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-green-800/30 hover:bg-green-700/40 transition-colors" />              <ResizablePanel defaultSize={50} className="overflow-hidden shadow-lg shadow-green-900/20">
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  onCodeChange={handleCodeChange}
                  onLanguageChange={handleLanguageChange}
                  editorPosition={editorPosition}
                  setEditorPosition={setEditorPosition}
                  isFullscreen={isFullscreen}
                  toggleFullscreen={toggleFullscreen}
                  timerRef={timerRef}
                  timerRunningRef={timerRunningRef}
                  timerDisplayRef={timerDisplayRef}
                  toggleTimer={toggleTimer}
                  resetTimer={resetTimer}
                  problemId={problemId}
                  autoSaveEnabled={autoSaveEnabled}
                  setAutoSaveEnabled={setAutoSaveEnabled}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: 'bg-black/80 border border-green-800/50 text-green-400',
            duration: 2000,
            style: {
              background: 'black',
              color: 'white',
            },
          }}
        />
      </>
    );
  };
export default Solve;