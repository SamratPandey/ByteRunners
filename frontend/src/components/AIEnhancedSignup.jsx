import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authApi from '../utils/authApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faRobot,
  faSpinner,
  faCheck,
  faArrowRight,
  faArrowLeft,
  faBrain
} from '@fortawesome/free-solid-svg-icons';

const AIEnhancedSignup = () => {
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Basic signup data
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // AI-generated questions and responses
  const [aiQuestions, setAiQuestions] = useState([]);
  const [questionResponses, setQuestionResponses] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState({});

  // Generate personalized questions after basic info
  const generatePersonalizedQuestions = async () => {
    if (currentStep !== 2) return;
    
    setLoadingQuestions(true);
    try {
      const userProfile = {
        name: signupData.name,
        interests: [],
        experience: 'beginner'
      };
      
      const response = await authApi.post('/api/onboarding/generate-questions', {
        userProfile
      });
      
      if (response.data.success) {
        setAiQuestions(response.data.data.questions);
        toast.success('✨ Personalized questions generated just for you!', {
          style: {
            background: '#22c55e',
            color: 'white',
            fontWeight: '500'
          },
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Unable to generate personalized questions. We\'ll use standard ones.', {
        style: {
          background: '#f59e0b',
          color: 'white',
          fontWeight: '500'
        },
        duration: 3000
      });
      
      // Use fallback questions
      setAiQuestions([
        {
          id: 'programming_languages',
          question: 'Which programming languages have you worked with before?',
          type: 'multiple_choice',
          options: ['JavaScript', 'Python', 'Java', 'C++', 'None'],
          allowMultiple: true,
          category: 'background'
        },
        {
          id: 'learning_goals',
          question: 'What\'s your primary goal for learning programming?',
          type: 'single_choice',
          options: ['Career change', 'Skill improvement', 'Personal projects', 'Academic requirements'],
          category: 'goals'
        }
      ]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle question responses
  const handleQuestionResponse = (questionId, answer) => {
    setQuestionResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!signupData.name.trim()) newErrors.name = 'Name is required';
      if (!signupData.email.trim()) newErrors.email = 'Email is required';
      if (!/^\S+@\S+\.\S+$/.test(signupData.email)) newErrors.email = 'Invalid email format';
      if (!signupData.password) newErrors.password = 'Password is required';
      if (signupData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const nextStep = async () => {
    if (!validateStep(currentStep)) return;
    
    if (currentStep === 1) {
      // Generate AI questions after basic info
      setCurrentStep(2);
      await generatePersonalizedQuestions();
    } else if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle final signup submission
  const handleSignup = async () => {
    setSubmitting(true);
    
    try {
      // First register the user
      const signupResponse = await authApi.post('/api/auth/register', {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password
      });
      
      if (signupResponse.data.success) {
        // Save onboarding data with AI question responses
        const onboardingData = {
          experienceLevel: questionResponses.experience_level || 'beginner',
          interests: questionResponses.career_focus ? [questionResponses.career_focus] : [],
          languages: questionResponses.programming_languages || [],
          aiQuestionResponses: questionResponses,
          skillAssessment: {
            score: 0,
            responses: {}
          }
        };
        
        await authApi.post('/api/onboarding/save', onboardingData);
        
        toast.success('🎉 Welcome to ByteRunners! Your personalized learning journey is ready.', {
          style: {
            background: '#22c55e',
            color: 'white',
            fontWeight: '500'
          },
          duration: 4000
        });
        
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage, {
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        },
        duration: 4000
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
              <p className="text-gray-400">Join thousands of developers improving their skills</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={signupData.name}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-black/50 border ${errors.name ? 'border-red-500' : 'border-green-800'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={signupData.email}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-black/50 border ${errors.email ? 'border-red-500' : 'border-green-800'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">
                  <FontAwesomeIcon icon={faLock} className="mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={signupData.password}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-black/50 border ${errors.password ? 'border-red-500' : 'border-green-800'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400`}
                  placeholder="Create a strong password"
                />
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">
                  <FontAwesomeIcon icon={faLock} className="mr-2" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={signupData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-black/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-green-800'} rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FontAwesomeIcon icon={faBrain} className="text-5xl text-green-400 mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">AI Personalization</h2>
              <p className="text-gray-400">We're creating personalized questions based on your profile...</p>
            </div>
            
            {loadingQuestions ? (
              <div className="text-center py-12">
                <FontAwesomeIcon icon={faSpinner} className="text-4xl text-green-400 animate-spin mb-4" />
                <p className="text-white text-lg">Generating your personalized questions...</p>
                <p className="text-gray-400 mt-2">This may take a few moments</p>
              </div>
            ) : (
              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FontAwesomeIcon icon={faCheck} className="text-green-400 mr-2" />
                  <span className="text-white font-medium">Questions Ready!</span>
                </div>
                <p className="text-gray-300">
                  We've generated {aiQuestions.length} personalized questions to better understand your learning goals and create the perfect experience for you.
                </p>
              </div>
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FontAwesomeIcon icon={faRobot} className="text-5xl text-green-400 mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Tell Us About Yourself</h2>
              <p className="text-gray-400">Help us personalize your learning journey</p>
            </div>
            
            <div className="space-y-6">
              {aiQuestions.map((question, index) => (
                <div key={question.id} className="bg-black/30 border border-green-800/50 rounded-lg p-6">
                  <h3 className="text-white font-medium mb-4">
                    {index + 1}. {question.question}
                  </h3>
                  
                  <div className="space-y-2">
                    {question.type === 'multiple_choice' && question.allowMultiple ? (
                      // Multiple selection
                      question.options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(questionResponses[question.id] || []).includes(option)}
                            onChange={(e) => {
                              const current = questionResponses[question.id] || [];
                              if (e.target.checked) {
                                handleQuestionResponse(question.id, [...current, option]);
                              } else {
                                handleQuestionResponse(question.id, current.filter(item => item !== option));
                              }
                            }}
                            className="mr-3 text-green-400"
                          />
                          <span className="text-gray-300">{option}</span>
                        </label>
                      ))
                    ) : (
                      // Single selection
                      question.options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={questionResponses[question.id] === option}
                            onChange={(e) => handleQuestionResponse(question.id, e.target.value)}
                            className="mr-3 text-green-400"
                          />
                          <span className="text-gray-300">{option}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FontAwesomeIcon icon={faCheck} className="text-5xl text-green-400 mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Almost Ready!</h2>
              <p className="text-gray-400">Review your information and complete registration</p>
            </div>
            
            <div className="bg-black/30 border border-green-800/50 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">Your Profile Summary</h3>
              
              <div className="space-y-3 text-gray-300">
                <div><strong>Name:</strong> {signupData.name}</div>
                <div><strong>Email:</strong> {signupData.email}</div>
                <div><strong>Responses:</strong> {Object.keys(questionResponses).length} questions answered</div>
              </div>
            </div>
            
            <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-6">
              <h4 className="text-green-400 font-medium mb-2">What happens next?</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Your account will be created instantly</li>
                <li>• AI will analyze your responses for personalization</li>
                <li>• You'll get customized learning recommendations</li>
                <li>• Access to your personalized dashboard</li>
              </ul>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Step {currentStep} of {totalSteps}</span>
            <span className="text-gray-400 text-sm">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-black/80 border border-green-900 rounded-2xl p-8">
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={loadingQuestions}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingQuestions ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  <>
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSignup}
                disabled={submitting}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <FontAwesomeIcon icon={faCheck} className="ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="text-green-400 hover:text-green-300 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedSignup;
