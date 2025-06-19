import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { testApi } from '../utils/testApi';
import Nav from './Nav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faCheckCircle, 
  faTimesCircle, 
  faSpinner,
  faArrowLeft,
  faArrowRight,
  faBrain,
  faLightbulb,
  faFlag,
  faPlay
} from '@fortawesome/free-solid-svg-icons';

const AITestInterface = () => {
  const navigate = useNavigate();
  const { subject, topic, difficulty } = useParams();
    const [testState, setTestState] = useState('setup'); // setup, loading, taking, completed
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionTimings, setQuestionTimings] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes default
  const [testStartTime, setTestStartTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());

  // Test configuration
  const [testConfig, setTestConfig] = useState({
    subject: subject || 'javascript',
    topic: topic || 'fundamentals',
    difficulty: difficulty || 'beginner',
    questionCount: 10,
    timeLimit: 30 // minutes
  });

  useEffect(() => {
    if (testState === 'taking' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testState, timeRemaining]);

  // Track question start time when question changes
  useEffect(() => {
    if (testState === 'taking' && questions.length > 0) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, testState]);

  // Track question timing when moving between questions
  useEffect(() => {
    if (testState === 'taking' && questions.length > 0) {
      // Record time for previous question if we're switching questions
      if (questionStartTime && currentQuestionIndex > 0) {
        const prevQuestionId = questions[currentQuestionIndex - 1]?._id;
        if (prevQuestionId) {
          const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
          setQuestionTimings(prev => ({
            ...prev,
            [prevQuestionId]: (prev[prevQuestionId] || 0) + timeSpent
          }));
        }
      }
      
      // Start timing for current question
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, testState, questions]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  const generateTest = async () => {
    try {
      setLoading(true);
      setTestState('loading');
      
      const response = await testApi.generateQuestions(
        testConfig.subject,
        testConfig.topic,
        testConfig.difficulty,
        testConfig.questionCount
      );
      
      // Validate the response
      if (!response || !response.data || !response.data.questions) {
        throw new Error('Invalid response from server');
      }
      
      if (!Array.isArray(response.data.questions) || response.data.questions.length === 0) {
        throw new Error('No questions received from server');
      }
      
      // Validate each question has required properties
      const validQuestions = response.data.questions.filter(q => 
        q && q.question && q.options && Array.isArray(q.options) && q._id
      );
      
      if (validQuestions.length === 0) {
        throw new Error('No valid questions received');
      }
      
      setQuestions(validQuestions);
      setCurrentQuestionIndex(0); // Reset to first question
      setAnswers({}); // Reset answers
      setTestState('taking');
      setTestStartTime(Date.now());
      setTimeRemaining(testConfig.timeLimit * 60);
      
      toast.success(`Your personalized ${testConfig.subject} test is ready! Good luck!`, {
        style: {
          background: '#22c55e',
          color: 'white',
          fontWeight: '500'
        },
        duration: 3000
      });
    } catch (error) {
      console.error('Error generating test:', error);
      
      let errorMessage = 'We\'re having trouble generating your test right now. Please try again in a moment.';
      
      if (error.response?.status === 401) {
        errorMessage = 'You need to be logged in to take a test. Please log in and try again.';
        // Optionally redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.response?.status === 403) {
        errorMessage = 'You don\'t have permission to access this feature.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        },
        duration: 4000
      });
      setTestState('setup');
    } finally {
      setLoading(false);
    }
  };

  // Safe navigation function to prevent out-of-bounds access
  const safeSetCurrentQuestionIndex = (newIndex) => {
    if (!questions || questions.length === 0) {
      console.warn('Cannot set question index: no questions loaded');
      return;
    }
    
    const safeIndex = Math.max(0, Math.min(questions.length - 1, newIndex));
    setCurrentQuestionIndex(safeIndex);
  };
  const handleAnswerSelect = (questionId, selectedAnswer) => {
    // Record time spent on current question
    if (questionStartTime && questionId) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      setQuestionTimings(prev => ({
        ...prev,
        [questionId]: (prev[questionId] || 0) + timeSpent
      }));
    }

    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
  };

  const handleFlagQuestion = (questionIndex) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };
  const handleSubmitTest = async () => {
    try {
      setLoading(true);
      
      // Record final question timing
      const currentQuestion = questions[currentQuestionIndex];
      if (questionStartTime && currentQuestion?._id) {
        const finalTimeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        setQuestionTimings(prev => ({
          ...prev,
          [currentQuestion._id]: (prev[currentQuestion._id] || 0) + finalTimeSpent
        }));
      }
      
      const timeSpent = Math.floor((Date.now() - testStartTime) / 1000);
      
      const submissionData = {
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
          timeSpent: questionTimings[questionId] || Math.floor(timeSpent / Object.keys(answers).length)
        })),
        timeSpent,
        subject: testConfig.subject,
        topic: testConfig.topic,
        difficulty: testConfig.difficulty
      };const response = await testApi.submitAnswers(submissionData);
      setTestResults(response.data);
      setTestState('completed');
      
      toast.success('🎯 Test submitted successfully! Let\'s see how you did!', {
        style: {
          background: '#22c55e',
          color: 'white',
          fontWeight: '500'
        },
        duration: 3000
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('We couldn\'t submit your test right now. Your answers are saved locally - please try submitting again.', {
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        },
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSetupPage = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="bg-black/80 border-green-900 p-8">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faBrain} className="text-6xl text-green-400 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">AI-Powered Coding Test</h1>
          <p className="text-gray-400">Personalized questions generated by AI based on your preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Subject Selection */}
          <div>
            <label className="block text-white font-semibold mb-3">Subject</label>
            <select
              value={testConfig.subject}
              onChange={(e) => setTestConfig(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-400"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="react">React</option>
              <option value="nodejs">Node.js</option>
            </select>
          </div>

          {/* Topic Selection */}
          <div>
            <label className="block text-white font-semibold mb-3">Topic</label>
            <select
              value={testConfig.topic}
              onChange={(e) => setTestConfig(prev => ({ ...prev, topic: e.target.value }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-400"
            >
              <option value="fundamentals">Fundamentals</option>
              <option value="data-structures">Data Structures</option>
              <option value="algorithms">Algorithms</option>
              <option value="oop">Object-Oriented Programming</option>
              <option value="async">Asynchronous Programming</option>
              <option value="testing">Testing</option>
            </select>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-white font-semibold mb-3">Difficulty</label>
            <select
              value={testConfig.difficulty}
              onChange={(e) => setTestConfig(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-400"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-white font-semibold mb-3">Number of Questions</label>
            <select
              value={testConfig.questionCount}
              onChange={(e) => setTestConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-400"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          {/* Time Limit */}
          <div className="md:col-span-2">
            <label className="block text-white font-semibold mb-3">Time Limit</label>
            <select
              value={testConfig.timeLimit}
              onChange={(e) => setTestConfig(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-400"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={generateTest}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Generating AI Test...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlay} className="mr-2" />
                Start AI Test
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderLoadingPage = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-6xl text-green-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">AI is generating your personalized test...</h2>
        <p className="text-gray-400">This may take a few moments</p>
      </div>
    </div>
  );
  const renderTestInterface = () => {
    // Check if questions are loaded and currentQuestionIndex is valid
    if (!questions || questions.length === 0) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-green-500 mb-4" />
            <p className="text-lg">Loading questions...</p>
            <p className="text-gray-400 mt-2">If this takes too long, please refresh the page</p>
          </div>
        </div>
      );
    }

    if (currentQuestionIndex >= questions.length || currentQuestionIndex < 0) {
      console.error('Invalid currentQuestionIndex:', currentQuestionIndex, 'questions.length:', questions.length);
      setCurrentQuestionIndex(0);
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading question...</p>
          </div>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      console.error('Current question is undefined:', currentQuestionIndex, questions);
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-red-500">Error loading question</p>
            <Button onClick={() => setTestState('setup')} className="mt-4">
              Return to Setup
            </Button>
          </div>
        </div>
      );
    }

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">AI Coding Test</h1>
              <span className="text-gray-400">
                {testConfig.subject} - {testConfig.topic} ({testConfig.difficulty})
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-yellow-400">
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                {formatTime(timeRemaining)}
              </div>
              
              <div className="text-gray-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 p-4">
              <h3 className="font-semibold text-white mb-4">Question Navigation</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">                {questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => safeSetCurrentQuestionIndex(index)}                    className={`w-10 h-10 rounded text-sm font-semibold relative ${
                      index === currentQuestionIndex
                        ? 'bg-green-600 text-white'
                        : question._id && (answers[question._id] !== undefined)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {index + 1}
                    {flaggedQuestions.has(index) && (
                      <FontAwesomeIcon 
                        icon={faFlag} 
                        className="absolute -top-1 -right-1 text-yellow-400 text-xs"
                      />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                  Answered
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                  Current
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faFlag} className="text-yellow-400 mr-2" />
                  Flagged
                </div>
              </div>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-800 p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <Button
                    onClick={() => handleFlagQuestion(currentQuestionIndex)}
                    variant="outline"
                    size="sm"
                    className={`${
                      flaggedQuestions.has(currentQuestionIndex)
                        ? 'border-yellow-400 text-yellow-400'
                        : 'border-gray-600 text-gray-400'
                    }`}
                  >
                    <FontAwesomeIcon icon={faFlag} className="mr-1" />
                    {flaggedQuestions.has(currentQuestionIndex) ? 'Unflag' : 'Flag'}
                  </Button>
                </div>
                  <p className="text-gray-300 text-lg leading-relaxed">
                  {currentQuestion.question || 'Question content loading...'}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">                {(currentQuestion.options || []).map((option, index) => (
                  <div
                    key={index}
                    onClick={() => currentQuestion._id && handleAnswerSelect(currentQuestion._id, index)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentQuestion._id && answers[currentQuestion._id] === index
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 hover:border-green-400'
                    }`}
                  >
                    <div className="flex items-center">                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        currentQuestion._id && answers[currentQuestion._id] === index
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-500'
                      }`}>
                        {currentQuestion._id && answers[currentQuestion._id] === index && (
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />
                        )}
                      </div>
                      <span className="text-white">{option}</span>
                    </div>
                  </div>
                ))}
              </div>              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  onClick={() => safeSetCurrentQuestionIndex(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Previous
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmitTest}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Test'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => safeSetCurrentQuestionIndex(currentQuestionIndex + 1)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderResultsPage = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="bg-black/80 border-green-900 p-8">
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faLightbulb} className="text-6xl text-green-400 mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Test Complete!</h1>
          <p className="text-gray-400">Here are your AI-powered results and recommendations</p>
        </div>

        {/* Score Summary */}
        <div className="bg-gradient-to-r from-green-500 to-green-700 p-6 rounded-lg mb-6">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2">
              {testResults.score}%
            </h2>
            <p className="text-xl">
              {testResults.correctAnswers} out of {testResults.totalQuestions} correct
            </p>
            <p className="text-green-100 mt-2">
              Time spent: {Math.floor(testResults.timeSpent / 60)}m {testResults.timeSpent % 60}s
            </p>
          </div>
        </div>

        {/* AI Analysis */}
        {testResults.aiAnalysis && (
          <div className="bg-gray-800/50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faBrain} className="text-green-400 mr-2" />
              AI Performance Analysis
            </h3>
            <div className="text-gray-300 space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Strengths:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {testResults.aiAnalysis.strengths?.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Areas for Improvement:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {testResults.aiAnalysis.improvements?.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Results */}
        <div className="bg-gray-800/50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Question by Question</h3>
          <div className="space-y-4">
            {testResults.detailedResults?.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                <span className="text-white">Question {index + 1}</span>
                <div className="flex items-center">
                  {result.isCorrect ? (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 mr-2" />
                  ) : (
                    <FontAwesomeIcon icon={faTimesCircle} className="text-red-400 mr-2" />
                  )}
                  <span className={result.isCorrect ? 'text-green-400' : 'text-red-400'}>
                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-x-4">
          <Button
            onClick={() => {
              setTestState('setup');
              setQuestions([]);
              setAnswers({});
              setCurrentQuestionIndex(0);
              setTestResults(null);
              setFlaggedQuestions(new Set());
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Take Another Test
          </Button>
            <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            Back to Profile
          </Button>
        </div>
      </Card>
    </div>
  );
  
  // Validate state consistency
  useEffect(() => {
    if (testState === 'taking') {
      // If we're in taking state but have no questions, reset to setup
      if (!questions || questions.length === 0) {
        console.warn('Test state is "taking" but no questions available, resetting to setup');
        setTestState('setup');
        return;
      }
      
      // If current question index is out of bounds, reset to 0
      if (currentQuestionIndex >= questions.length || currentQuestionIndex < 0) {
        console.warn('Current question index is out of bounds, resetting to 0');
        setCurrentQuestionIndex(0);
      }
    }
  }, [testState, questions, currentQuestionIndex]);

  useEffect(() => {
    // Log the current state and config for debugging
    console.log('Current Test State:', testState);
    console.log('Test Configuration:', testConfig);
  }, [testState, testConfig]);

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>
      <div className="pt-20">
        {testState === 'setup' && renderSetupPage()}
        {testState === 'loading' && renderLoadingPage()}
        {testState === 'taking' && renderTestInterface()}        {testState === 'completed' && renderResultsPage()}
      </div>
    </div>
  );
};

export default AITestInterface;
