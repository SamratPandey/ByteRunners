import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Code, Users, Terminal,  Github, Twitter, Linkedin, X, Play, Copy, Maximize2, Minimize2} from 'lucide-react';
import Editor from '@monaco-editor/react';
import Nav from './Nav';



//Problem code
const problemCodes = {
  "Hello World": {
    "C++": `// C++ solution for Hello World
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    Python: `# Python solution for Hello World
print("Hello, World!")`,
    Java: `// Java solution for Hello World
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    JavaScript: `// JavaScript solution for Hello World
console.log("Hello, World!");`,
  },
};


const OutputPanel = ({ isOpen, onClose, output, isLoading }) => {
  return (
    <div
      className={`fixed right-0 top-0 h-full w-96 bg-black/95 border-l border-green-900/50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-green-900/30">
          <h3 className="text-lg font-semibold text-green-500">Output</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-green-400 hover:bg-green-500/5"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
            </div>
          ) : (
            <div className="font-mono text-sm">
              {output.error ? (
                <div className="text-red-400">{output.error}</div>
              ) : (
                <>
                  {output.stdout && (
                    <div className="mb-4">
                      <div className="text-green-500 mb-2">Standard Output:</div>
                      <pre className="text-white whitespace-pre-wrap">{output.stdout}</pre>
                    </div>
                  )}
                  {output.stderr && (
                    <div className="mb-4">
                      <div className="text-red-500 mb-2">Standard Error:</div>
                      <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>
                    </div>
                  )}
                  {output.compile_output && (
                    <div>
                      <div className="text-yellow-500 mb-2">Compilation Output:</div>
                      <pre className="text-yellow-400 whitespace-pre-wrap">{output.compile_output}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

//Code editor for the HomePage
const CodeEditor = ({
  selectedProblem,
  language,
  onRunCode,
  onLanguageChange,
  onProblemChange,
}) => {
  const problems = problemCodes;
  const editorRef = useRef(null);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [output, setOutput] = useState('');
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentCode = problems[selectedProblem]?.[language] || '';

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setValue(currentCode);
    }
  }, [selectedProblem, language, currentCode]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.setValue(currentCode);
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    setIsOutputOpen(true);
    try {
      const code = editorRef.current.getValue();
      const result = await onRunCode(code, language);
      setOutput(result);
    } catch (error) {
      setOutput({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    const code = editorRef.current.getValue();
    await navigator.clipboard.writeText(code);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  const languageMap = {
    "C++": "cpp",
    Java: "java",
    Python: "python",
    JavaScript: "javascript",
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    readOnly: false,
  };

  return (
    <>
      <div className="flex flex-col bg-black/80 backdrop-blur-sm rounded-xl overflow-hidden border border-green-900/50 shadow-lg shadow-green-900/20 transition-all duration-300 relative">
        <div className="flex items-center justify-between border-b border-green-900/30 bg-black/60 px-4">
          <div className="flex items-center gap-2 py-3">
            {Object.keys(problemCodes).map((problem) => (
              <button
                key={problem}
                onClick={() => onProblemChange(problem)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedProblem === problem
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'text-gray-400 hover:bg-green-500/5 hover:text-green-400'
                }`}
              >
                {problem}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {Object.keys(languageMap).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  language === lang
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'text-gray-400 hover:bg-green-500/5 hover:text-green-400'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-green-900/30 bg-black/60 px-4">
          <div className="flex items-center gap-3 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-green-400 hover:bg-green-500/5"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copyStatus}
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4"
              onClick={handleRunCode}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Code
            </Button>
          </div>
        </div>

        <div className="h-[calc(100vh-280px)]">
          <Editor
            height="100%"
            defaultValue={currentCode}
            language={languageMap[language]}
            theme="vs-dark"
            options={{
              ...editorOptions,
              padding: { top: 16, bottom: 16 },
            }}
            onMount={handleEditorDidMount}
          />
        </div>
      </div>

      <OutputPanel
        isOpen={isOutputOpen}
        onClose={() => setIsOutputOpen(false)}
        output={output}
        isLoading={isLoading}
      />
    </>
  );
};

// Custom animated background component
const AnimatedBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%, rgba(22, 163, 74, 0.3) 0%, rgba(0, 0, 0, 0) 50%)`
        }}
      />
      <div className="absolute inset-0 bg-grid-white/[0.02]" />
    </div>
  );
};

// Animated card that responds to hover
const AnimatedCard = ({ children }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  return (
    <div
      className="relative transition-all duration-200 ease-linear"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotate({ x: 0, y: 0 });
      }}
      style={{
        transform: isHovered ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.05, 1.05, 1.05)` : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      }}
    >
      {children}
    </div>
  );
};

const Home = () => {

  const [selectedProblem, setSelectedProblem] = useState("Hello World");
  const [selectedLanguage, setSelectedLanguage] = useState("C++");
  const [editCode, setEditorCode] = useState("");

  const handleProblemChange = (problem) => {
    setSelectedProblem(problem);
    setEditorCode(problemCodes[problem][selectedLanguage]);
  };

  const handleLanguageChange = (language, code = null) => {
    setSelectedLanguage(language);
    setEditorCode(code || problemCodes[selectedProblem][language]);
  };

  const getLanguageId = (language) => {
    switch (language) {
      case "C++":
        return 54;
      case "Java":
        return 62;
      case "Python":
        return 71;
      case "JavaScript":
        return 63;
      default:
        return 54;
    }
  };

  const runCode = async (sourceCode, language) => {
    try {
      const languageId = getLanguageId(language); 
      console.log(`${import.meta.env.VITE_BACKEND_URL}`)
      console.log( {
        source_code: sourceCode,
        language_id: languageId,
        stdin:'',
      })
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/run-code`, {
        source_code: sourceCode,
        language_id: languageId,
        stdin:'',
      });
  
      return response.data; 
    } catch (error) {
      return { error: error.message };  // Return an error message if something goes wrong
    }
  };
  




  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Fixed Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden overscroll-none">
        <AnimatedBackground />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 blur-2xl opacity-20" />
                <Badge className="relative bg-green-500 text-white">For College Students</Badge>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Learn. Code.
                <br />
                Connect.
              </h1>
              <p className="text-xl text-gray-300">
                Your campus coding sanctuary. Practice programming, share knowledge, and build your 
                tech career alongside fellow students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="relative group bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg overflow-hidden">
                  <Link to={'/problems'} className="relative z-10">Start Coding Now</Link>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-950 px-8 py-6 text-lg">
                  Join Community
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 blur-3xl opacity-20" />
              <Terminal className="relative w-full h-96 text-green-500 opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid with Animated Cards */}
      <section className="py-20 bg-black relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 relative">
            <Badge className="bg-green-500/10 text-green-500 mb-4">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tools and resources designed specifically for college students in computer science and related fields.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Code className="w-8 h-8 text-green-500" />,
                title: "Practice Labs",
                description: "Interactive coding environments for Java, Python, C++, and more.",
                badge: "Popular"
              },
              {
                icon: <BookOpen className="w-8 h-8 text-green-500" />,
                title: "Course Resources",
                description: "Study materials aligned with your college curriculum.",
              },
              {
                icon: <Users className="w-8 h-8 text-green-500" />,
                title: "Study Groups",
                description: "Form virtual study groups and collaborate on projects.",
              }
            ].map((feature, index) => (
              <AnimatedCard key={index}>
                <Card className="p-6 bg-black border border-green-800 hover:border-green-600 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="mb-4">{feature.icon}</div>
                      {feature.badge && (
                        <Badge className="bg-green-500 text-white">{feature.badge}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-semibold text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>



    {/* IDE Layout Section */}
      <section className="relative py-20 bg-gradient-to-b from-black to-gray-900" aria-labelledby="editor-section">
        <h2 id="editor-section" className="sr-only">Code Editor and Problem Selector</h2>
        
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-20"
            style={{
              maskImage: 'radial-gradient(circle at center, transparent 40%, black)',
              WebkitMaskImage: 'radial-gradient(circle at center, transparent 40%, black)'
            }}
          />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-500">Code Playground</Badge>
            <h3 className="text-3xl font-bold text-white mb-4">
              Interactive Coding Environment
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Write, run, and test your code in multiple languages. Perfect for practicing algorithms and data structures.
            </p>
          </div>

          {/* Editor Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-3">
              <div className="rounded-xl overflow-hidden shadow-2xl bg-black/50 backdrop-blur border border-gray-800/50">
                <CodeEditor
                  selectedProblem={selectedProblem}
                  language={selectedLanguage}
                  onRunCode={runCode}
                  onLanguageChange={handleLanguageChange}
                  onProblemChange={handleProblemChange}
                />
              </div>
            </div>

            {/* Right Panel - Optional Information */}
            <div className="hidden lg:block">
              <div className="space-y-4">
                {/* Problem Info Card */}
                <Card className="bg-black/50 backdrop-blur border border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-green-500">Problem Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Current Problem</h4>
                        <p className="text-white">{selectedProblem}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400">Language</h4>
                        <p className="text-white">{selectedLanguage}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Tips Card */}
                <Card className="bg-black/50 backdrop-blur border border-gray-800/50">
                  <CardHeader>
                    <CardTitle className="text-green-500">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>Use Ctrl + Enter to run code</li>
                      <li>Switch languages anytime</li>
                      <li>Code is auto-saved</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer Section */}
      <footer className="bg-black">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">ByteRunners</h3>
              <p className="text-gray-400">
                Empowering college students with coding resources and community.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-green-500">
                  <Github className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-green-500">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-green-500">
                  <Linkedin className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Resources</h4>
              <ul className="space-y-2">
                {['Documentation', 'Tutorials', 'Examples', 'Blog'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-green-500">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Community</h4>
              <ul className="space-y-2">
                {['Discord Server', 'Forums', 'Events', 'Newsletter'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-green-500">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Legal</h4>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Code of Conduct'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-green-500">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-green-900 mt-12 pt-8">
            <p className="text-center text-gray-400">
              © {new Date().getFullYear()} ByteRunners. All rights reserved.
            </p>
          </div>
        </div>
      </footer>


    </div>
  );
};

export default Home;