import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { onboardingApi } from '../utils/testApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCode, 
  faGraduationCap, 
  faBriefcase, 
  faRocket,
  faPlay,
  faCheck,
  faArrowRight,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

// Goal options for the onboarding process
const goalOptions = [
  { value: 'career-change', label: 'Career Change' },
  { value: 'skill-improvement', label: 'Improve Skills' },
  { value: 'interview-prep', label: 'Interview Preparation' },
  { value: 'learning', label: 'Learn Programming' },
  { value: 'certification', label: 'Get Certified' },
  { value: 'freelancing', label: 'Start Freelancing' }
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    experienceLevel: '',
    interests: [],
    languages: [],
    goals: ''
  });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [skillAssessmentResults, setSkillAssessmentResults] = useState(null);
  const navigate = useNavigate();
  const totalSteps = 4;

  // Load skill assessment questions when user reaches step 3
  useEffect(() => {
    if (currentStep === 3 && quizQuestions.length === 0) {
      loadSkillAssessmentQuestions();
    }
  }, [currentStep]);

  const loadSkillAssessmentQuestions = async () => {
    try {
      setLoading(true);
      const response = await onboardingApi.getSkillAssessmentQuestions(userProfile.languages);
      setQuizQuestions(response.data.questions);    } catch (error) {
      toast.error('Unable to load assessment questions. Don\'t worry, we\'ve prepared some backup questions for you!', {
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        },
        duration: 4000
      });
      // Use fallback questions if API fails
      setQuizQuestions([
        {
          id: 'fallback1',
          question: "What does 'console.log()' do in JavaScript?",
          options: [
            "Creates a new console",
            "Prints output to the console", 
            "Logs into a system",
            "Creates a log file"
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const experienceOptions = [
    { value: 'beginner', label: 'Complete Beginner', icon: faGraduationCap },
    { value: 'intermediate', label: 'Intermediate', icon: faBriefcase },
    { value: 'advanced', label: 'Advanced', icon: faRocket }
  ];

  const interestOptions = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Game Development',
    'Cybersecurity',
    'DevOps',
    'UI/UX Design'
  ];
  const languageOptions = [
    'JavaScript',
    'Python',
    'Java',
    'C++',
    'React',
    'Node.js',
    'SQL',
    'HTML/CSS'
  ];

  const handleExperienceSelect = (experienceLevel) => {
    setUserProfile(prev => ({ ...prev, experienceLevel }));
  };

  const handleInterestToggle = (interest) => {
    setUserProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleLanguageToggle = (language) => {
    setUserProfile(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };
  const handleQuizAnswer = (questionId, selectedAnswer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
  };

  const validateAndSubmitAssessment = async () => {
    try {
      setLoading(true);
      
      // Prepare answers for validation
      const answers = Object.entries(quizAnswers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      }));

      // Validate assessment with backend
      const validationResponse = await onboardingApi.validateSkillAssessment(answers);
      setSkillAssessmentResults(validationResponse.data);
      
      return validationResponse.data;    } catch (error) {
      toast.error('We couldn\'t validate your assessment right now, but we\'ve calculated a preliminary score for you!', {
        style: {
          background: '#f59e0b',
          color: 'white',
          fontWeight: '500'
        },
        duration: 4000
      });
      
      // Fallback calculation
      let correctAnswers = 0;
      const totalQuestions = quizQuestions.length;
      
      const results = {
        score: (correctAnswers / totalQuestions) * 100,
        correctAnswers,
        totalQuestions,
        results: Object.entries(quizAnswers).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
          isCorrect: false // We don't have correct answers in fallback
        }))
      };
      
      setSkillAssessmentResults(results);
      return results;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = (score, profile) => {
    const percentage = (score / quizQuestions.length) * 100;
    
    if (percentage >= 80) {
      return {
        level: "Advanced",
        message: "Excellent! You have a strong foundation.",
        suggestions: [
          "Try advanced algorithm challenges",
          "Work on system design problems",
          "Contribute to open source projects"
        ]
      };
    } else if (percentage >= 60) {
      return {
        level: "Intermediate",
        message: "Good job! You have solid basics.",
        suggestions: [
          "Practice data structures",
          "Build more complex projects",
          "Learn design patterns"
        ]
      };
    } else if (percentage >= 40) {
      return {
        level: "Beginner+",
        message: "You're on the right track!",
        suggestions: [
          "Review fundamental concepts",
          "Practice basic coding exercises",
          "Take our beginner courses"
        ]
      };
    } else {
      return {
        level: "Beginner",
        message: "Great start! Everyone begins somewhere.",
        suggestions: [
          "Start with our basic tutorials",
          "Practice simple coding problems",
          "Build your first projects"
        ]
      };
    }
  };
  const handleNext = async () => {
    if (currentStep === 3) {      // Validate skill assessment before proceeding
      if (Object.keys(quizAnswers).length !== quizQuestions.length) {
        toast.error('Please answer all assessment questions before proceeding to see your results!', {
          style: {
            background: '#ef4444',
            color: 'white',
            fontWeight: '500'
          },
          duration: 4000
        });
        return;
      }
      
      // Validate assessment with backend
      await validateAndSubmitAssessment();
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      // Prepare onboarding data for backend
      const onboardingData = {
        experienceLevel: userProfile.experienceLevel,
        interests: userProfile.interests,
        languages: userProfile.languages,
        skillAssessment: skillAssessmentResults?.results || []
      };

      // Save to backend
      const response = await onboardingApi.saveOnboardingData(onboardingData);
        // Set the onboarding completion flag that Home component checks for
      localStorage.setItem('onboardingCompleted', 'true');
        toast.success('Welcome to ByteRunners! Your personalized coding journey starts now!', {
        style: {
          background: '#22c55e',
          color: 'white',
          fontWeight: '500'        },
        duration: 3000
      });
      navigate('/');    } catch (error) {
      toast.error('We encountered an issue saving your profile. Please try again, or contact support if the problem persists.', {
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">What's your coding experience?</h2>
              <p className="text-gray-400">This helps us personalize your learning journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experienceOptions.map((option) => (
                <div
                  key={option.value}                  onClick={() => handleExperienceSelect(option.value)}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    userProfile.experienceLevel === option.value
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-green-400'
                  }`}
                >
                  <div className="text-center">
                    <FontAwesomeIcon 
                      icon={option.icon} 
                      className="text-3xl mb-3 text-green-400" 
                    />
                    <h3 className="text-lg font-semibold text-white">{option.label}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">What interests you most?</h2>
              <p className="text-gray-400">Select all that apply</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestOptions.map((interest) => (
                <div
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                    userProfile.interests.includes(interest)
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-green-400'
                  }`}
                >
                  <span className="text-white text-sm">{interest}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-4">Preferred Languages/Technologies</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">                {languageOptions.map((language) => (
                  <div
                    key={language}
                    onClick={() => handleLanguageToggle(language)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                      userProfile.languages.includes(language)
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 hover:border-green-400'
                    }`}
                  >
                    <span className="text-white text-sm">{language}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">What's your main goal?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map((goal) => (
                  <div
                    key={goal.value}
                    onClick={() => setUserProfile(prev => ({ ...prev, goals: goal.value }))}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      userProfile.goals === goal.value
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 hover:border-green-400'
                    }`}
                  >
                    <span className="text-white">{goal.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Quick Skills Assessment</h2>
              <p className="text-gray-400">Answer a few questions to help us understand your current level</p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-green-400 mb-4" />
                <p className="text-gray-400">Loading assessment questions...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {quizQuestions.map((question, index) => (
                  <div key={question.id} className="bg-gray-800/50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {index + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          onClick={() => handleQuizAnswer(question.id, option)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            quizAnswers[question.id] === option
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-gray-600 hover:border-green-400'
                          }`}
                        >
                          <span className="text-white">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );      case 4:
        const results = skillAssessmentResults;
        return (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Results Are Ready!</h2>
              <p className="text-gray-400">Here's what we recommend for your coding journey</p>
            </div>
            
            {results && (
              <div className="bg-gradient-to-r from-green-500 to-green-700 p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Score: {results.correctAnswers}/{results.totalQuestions} ({Math.round(results.score)}%)
                </h3>
                <p className="text-xl text-white">
                  Level: {results.score >= 80 ? 'Advanced' : results.score >= 60 ? 'Intermediate' : 'Beginner'}
                </p>
                <p className="text-green-100 mt-2">
                  {results.score >= 80 ? 'Excellent! You have a strong foundation.' :
                   results.score >= 60 ? 'Good job! You have solid basics.' :
                   'Great start! Everyone begins somewhere.'}
                </p>
              </div>
            )}

            <div className="bg-gray-800/50 p-6 rounded-lg text-left">
              <h4 className="text-lg font-semibold text-white mb-4">Your Profile Summary:</h4>
              <div className="space-y-2 text-gray-300">
                <p><strong>Experience:</strong> {experienceOptions.find(e => e.value === userProfile.experienceLevel)?.label}</p>
                <p><strong>Interests:</strong> {userProfile.interests.join(', ')}</p>
                <p><strong>Languages:</strong> {userProfile.languages.join(', ')}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Welcome to ByteRunners!</h1>
            <span className="text-gray-400">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-black/80 border-green-900 p-8">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              variant="outline"
              className="border-green-900 text-white hover:bg-green-900"
            >
              Previous
            </Button>
              {currentStep === totalSteps ? (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <FontAwesomeIcon icon={faCheck} className="ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  loading ||
                  (currentStep === 1 && !userProfile.experienceLevel) ||
                  (currentStep === 2 && (userProfile.interests.length === 0 || userProfile.languages.length === 0))
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <>
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>        </Card>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Onboarding;
