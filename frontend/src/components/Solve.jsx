import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { Copy, Maximize2, Minimize2, X, Play, Pause, RotateCcw, Send } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast, Toaster } from 'react-hot-toast';
import Nav from './Nav';
import authApi from '../utils/authApi';

const ProblemDetailsPanel = ({ problem }) => {
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
    problemId 
  }) => {
    const editorRef = useRef(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [output, setOutput] = useState(null);
    
    const handleEditorDidMount = (editor, monaco) => {
      editorRef.current = editor;
      
      editor.onDidChangeCursorPosition(e => {
        setEditorPosition({
          lineNumber: e.position.lineNumber,
          column: e.position.column
        });
      });
    };
    
    const copyCode = () => {
      navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard!');
    };
    

    
    const runCode = async () => {
      if (!code.trim()) {
        toast.error('Please write some code first', { id: 'runCode' });
        return;
      }
      
      try {
        toast.loading('Running your code...', { id: 'runCode' });
        setIsRunning(true);
        
        const response = await authApi.post(
          '/api/auth/run-code',
          {
            source_code: code,
            language_id: languageIdMap[selectedLanguage],
            stdin: '' 
          }
        );
        
        setIsRunning(false);
        
        if (response.data.success) {
          toast.success('Code executed successfully', { id: 'runCode' });
          setOutput({
            status: 'success',
            stdout: response.data.stdout || 'No output',
            time: response.data.time,
            memory: response.data.memory
          });
        } else {
          setOutput({
            status: 'success',
            stderr: response.data|| response.data.compile_output || 'Unknown error',
            error: response.data.message || 'Execution failed'
          });
        }
      } catch (error) {
        setIsRunning(false);
        setOutput({
          status: 'error',
          error: error.response?.data?.error || error.message || 'Network error'
        });
      }
    };
    
    const submitCode = async () => {
      if (!code.trim()) {
        toast.error('Please write some code before submitting');
        return;
      }
      
      setIsSubmitting(true);
      toast.loading('Submitting solution...', { id: 'submitCode' });
      
      try {
        const userId = localStorage.getItem("userId"); 
        
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/submit`,
          {
            userId,
            problemId,
            code
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        
        setIsSubmitting(false);
        
        if (response.data.status === 'solved') {
          toast.success('🎉 ' + response.data.message, { id: 'submitCode', duration: 3000 });
          setOutput({
            status: 'success',
            message: 'Problem solved! Solution accepted.'
          });
        } else {
          toast.error(response.data.message, { id: 'submitCode' });
          setOutput({
            status: 'error',
            message: response.data.message || 'Submission failed'
          });
        }
      } catch (error) {
        setIsSubmitting(false);
        toast.error('Error submitting solution', { id: 'submitCode' });
        setOutput({
          status: 'error',
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
      fontSize: 14,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      lineNumbers: 'on',
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      tabSize: 2,
    };
    
    return (
      <div className="flex flex-col h-full">
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
              >
                <span className="inline-block">
                  {timerRunningRef.current ? <Pause size={10} /> : <Play size={10} />}
                </span>
                <span>{timerRunningRef.current ? 'Pause' : 'Start'}</span>
              </button>
              
              <button 
                onClick={resetTimer}
                className="text-gray-400 hover:text-green-400 transition-colors text-xs bg-black/60 border border-green-800/50 px-2 py-1 rounded flex items-center space-x-1"
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
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={runCode}
              disabled={isRunning}
              className={`text-gray-200 hover:text-black transition-colors text-xs ${
                isRunning ? 'bg-green-700/50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
              } border border-green-800/50 px-2 py-1 rounded flex items-center space-x-1`}
            >
              <Play size={10}/>
              <span>{isRunning ? 'Running...' : 'Run'}</span>
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
  
            <button 
              onClick={copyCode}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-1 rounded-full hover:bg-green-900/30"
              aria-label="Copy code"
            >
              <Copy size={16} />
            </button>
            
            <button 
              onClick={toggleFullscreen}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-1 rounded-full hover:bg-green-900/30"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            
            {isFullscreen && (
              <button 
                onClick={toggleFullscreen}
                className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-1 rounded-full hover:bg-green-900/30"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-grow relative flex flex-col">
          <div className={`${output ? 'h-3/5' : 'h-full'}`}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={selectedLanguage}
              value={code}
              onChange={onCodeChange}
              onMount={handleEditorDidMount}
              options={editorOptions}
            />
          </div>
          
          {output && (
            <div className="h-2/5 border-t border-green-800/70 bg-black/90 p-4 overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className={`text-sm font-medium ${
                  output.status === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {output.status === 'success' ? 'Output' : 'Error'}
                </h3>
                <button 
                  onClick={() => setOutput(null)}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                  aria-label="Close output"
                >
                  <X size={14} />
                </button>
              </div>
              
              {output.status === 'success' && (
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
    const { problemId } = useParams();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('// Start coding here');
    const [editorPosition, setEditorPosition] = useState({ lineNumber: 1, column: 1 });
  
    const timerRef = useRef(0);
    const timerRunningRef = useRef(false);
    const timerDisplayRef = useRef(null);
    const timerIntervalRef = useRef(null);
  
    const formatTime = (seconds) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
      const fetchProblem = async () => {
        if (!problemId) return;
        
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/problem/${problemId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
  
          if (!response.data) {
            toast.error("No problem found.");
            return;
          }
  
          setProblem(response.data);
          
          if (response.data.codeTemplates && response.data.codeTemplates[selectedLanguage]) {
            setCode(response.data.codeTemplates[selectedLanguage]);
          }
        } catch (error) {
          toast.error("Error fetching problem.");
        }
      };
  
      fetchProblem();
    }, [problemId]);

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
        {!isFullscreen && <Nav />}
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black/95' : 'relative w-full mt-[65px]'}`}>
          {isFullscreen ? (
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
              />
            </div>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="max-w-full md:min-w-[450px]">
              <ResizablePanel className="overflow-hidden shadow-lg shadow-green-900/20">
                <div className="h-[102vh]">
                  <ProblemDetailsPanel problem={problem} />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle className="bg-green-800/30 hover:bg-green-700/40 transition-colors" />
              <ResizablePanel defaultSize={50} className="overflow-hidden shadow-lg shadow-green-900/20">
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
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
        <Toaster 
          position="top-right"
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