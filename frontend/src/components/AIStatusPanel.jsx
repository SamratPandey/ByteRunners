import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBrain, 
  faRobot, 
  faSpinner, 
  faCheckCircle,
  faExclamationTriangle,
  faPlay,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import authApi from '../utils/authApi';
import { toast } from 'react-hot-toast';

const AIStatusBadge = ({ status }) => {
  if (status === 'checking') {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-yellow-400 mr-2" />
        <span className="text-yellow-400 text-sm font-medium">Checking AI...</span>
      </div>
    );
  }
  
  if (status === 'enabled') {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
        <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 mr-2" />
        <span className="text-green-400 text-sm font-medium">AI Powered</span>
      </div>
    );
  }
  
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 mr-2" />
      <span className="text-red-400 text-sm font-medium">AI Unavailable</span>
    </div>
  );
};

const AIFeatureCard = ({ icon, title, description, enabled, testFunction }) => {
  const [testing, setTesting] = useState(false);
  
  const handleTest = async () => {
    if (!testFunction || !enabled) return;
    
    setTesting(true);
    try {
      await testFunction();
      toast.success(`${title} is working perfectly!`, {
        style: {
          background: '#22c55e',
          color: 'white',
          fontWeight: '500'
        }
      });
    } catch (error) {
      toast.error(`${title} test failed: ${error.message}`, {
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        }
      });
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 ${
      enabled 
        ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' 
        : 'bg-gray-500/5 border-gray-500/20'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${
          enabled ? 'bg-green-500/20' : 'bg-gray-500/20'
        }`}>
          <FontAwesomeIcon 
            icon={icon} 
            className={`text-xl ${enabled ? 'text-green-400' : 'text-gray-400'}`} 
          />
        </div>
        {testFunction && enabled && (
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-3 py-1 bg-green-600/20 border border-green-600/30 text-green-400 rounded-lg text-sm hover:bg-green-600/30 transition-colors disabled:opacity-50"
          >
            {testing ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
          </button>
        )}
      </div>
      
      <h3 className={`font-semibold mb-2 ${enabled ? 'text-white' : 'text-gray-400'}`}>
        {title}
      </h3>
      <p className={`text-sm ${enabled ? 'text-gray-300' : 'text-gray-500'}`}>
        {description}
      </p>
      
      <div className="mt-3">
        <span className={`text-xs px-2 py-1 rounded-full ${
          enabled 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {enabled ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  );
};

const AIStatusPanel = () => {
  const [aiStatus, setAiStatus] = useState('checking');
  const [aiFeatures, setAiFeatures] = useState({});
  const [loading, setLoading] = useState(true);
  
  const checkAIStatus = async () => {
    try {
      const response = await authApi.get('/api/test/ai-status');
      const { aiEnabled, features } = response.data.data;
      
      setAiStatus(aiEnabled ? 'enabled' : 'disabled');
      setAiFeatures(features);
    } catch (error) {
      console.error('Error checking AI status:', error);
      setAiStatus('disabled');
    } finally {
      setLoading(false);
    }
  };
  
  const testAIConnection = async () => {
    const response = await authApi.get('/api/test/test-ai-connection');
    return response.data;
  };
  
  useEffect(() => {
    checkAIStatus();
  }, []);
  
  if (loading) {
    return (
      <div className="bg-black/30 border border-green-800/50 rounded-2xl p-8">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-green-400 animate-spin mb-4" />
          <p className="text-white">Checking AI capabilities...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-black/30 border border-green-800/50 rounded-2xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Features</h2>
          <p className="text-gray-400">Enhanced learning with OpenAI integration</p>
        </div>
        <AIStatusBadge status={aiStatus} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AIFeatureCard
          icon={faBrain}
          title="Smart Question Generation"
          description="AI generates personalized coding questions based on your skill level and learning history."
          enabled={aiFeatures.questionGeneration}
          testFunction={testAIConnection}
        />
        
        <AIFeatureCard
          icon={faChartLine}
          title="Performance Analysis"
          description="Get detailed AI analysis of your test performance with personalized improvement suggestions."
          enabled={aiFeatures.testAnalysis}
        />
        
        <AIFeatureCard
          icon={faRobot}
          title="Personalized Onboarding"
          description="AI creates custom onboarding questions to understand your learning goals and preferences."
          enabled={aiFeatures.onboardingQuestions}
        />
        
        <AIFeatureCard
          icon={faChartLine}
          title="Learning Recommendations"
          description="Receive AI-powered recommendations for topics to study and resources to improve your skills."
          enabled={aiFeatures.recommendations}
        />
      </div>
      
      {aiStatus === 'disabled' && (
        <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 mt-1 mr-3" />
            <div>
              <h4 className="text-yellow-400 font-medium mb-2">AI Features Not Available</h4>
              <p className="text-gray-300 text-sm">
                AI features require OpenAI API configuration. Don't worry - you can still use all the core features 
                of ByteRunners including code execution, progress tracking, and course access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStatusPanel;
