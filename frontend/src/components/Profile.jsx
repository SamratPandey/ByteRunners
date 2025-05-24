import React, { useEffect, useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Code, 
  Target, 
  LogOut, 
  Users, 
  Activity,
  Medal,
  Settings,
  Calendar,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
  Twitter,
  Instagram,
  Facebook
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Nav from './Nav';
import { logout } from '../redux/actions/authActions';
import authApi from '../utils/authApi';

// Utility function to safely capitalize first letter
const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Social Media Component (unchanged from previous version)
const SocialMediaLinks = ({ socialLinks = {} }) => {
  const socialPlatforms = [
    { 
      key: 'github', 
      icon: Github,  
      baseUrl: 'https://github.com/' 
    },
    { 
      key: 'linkedin', 
      icon: Linkedin, 
      baseUrl: 'https://www.linkedin.com/in/' 
    },
    { 
      key: 'website', 
      icon: Globe, 
      baseUrl: '' 
    },
    { 
      key: 'twitter', 
      icon: Twitter, 
      baseUrl: 'https://twitter.com/' 
    },
    { 
      key: 'instagram', 
      icon: Instagram, 
      baseUrl: 'https://www.instagram.com/' 
    },
    { 
      key: 'facebook', 
      icon: Facebook, 
      baseUrl: 'https://www.facebook.com/' 
    }
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
      {socialPlatforms.map((platform) => {
        const url = socialLinks[platform.key];
        if (!url) return null;

        const fullUrl = platform.key === 'website' 
          ? url 
          : `${platform.baseUrl}${url}`;

        const Icon = platform.icon;

        return (
          <a
            key={platform.key}
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group flex items-center space-x-2 
              text-gray-400 hover:text-green-400 
              transition-all duration-300
            "
          >
            <Icon 
              className="
                w-6 h-6 
                group-hover:scale-110 
                transition-transform
              " 
            />
            <span className="text-sm hidden md:block">
              {capitalizeFirstLetter(platform.key)}
            </span>
          </a>
        );
      })}
    </div>
  );
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
  
    const fetchUserProfile = async () => {
      try {
        const response = await authApi.get('/api/auth/profile');
  
        const result = response.data;
  
        if (result.success) {
          setUserData(result.data);
          setIsLoading(false);
        }      } catch (error) {
        dispatch(logout());
        toast("Session expired. Please login again.", { icon: '❌' });
        navigate('/login', { replace: true });
      }
    };
  
    fetchUserProfile();
  }, [isAuthenticated, dispatch, navigate]);
  const handleLogout = () => {
    dispatch(logout());
    toast("Logged out successfully!", { icon: '✅' });
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse w-16 h-16 bg-green-500 rounded-full" />
      </div>
    );
  }
  
  if (!userData) {
    return null;
  }

  const { profile, performance, achievements } = userData;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>
      <div className="container mx-auto px-4 py-12 pt-24 relative z-20">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-900/80 to-transparent z-10 -mb-12" />
        
        <div className="container mx-auto px-4 py-12 relative z-20">
          <div className="max-w-6xl mx-auto bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gray-800 p-8 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <img 
                src={profile.avatar} 
                alt="Profile" 
                className="w-40 h-40 rounded-full border-4 border-green-500 object-cover shadow-lg"
              />
              <div className="text-center md:text-left w-full">
                <h1 className="text-4xl font-bold text-green-400 mb-2">
                  {profile.name}
                </h1>
                
                <div className="flex justify-between items-center">
                  <div className="flex space-x-4 items-center">
                    <span className={`
                      ${profile.accountType === 'premium' 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : 'bg-green-500/20 text-green-400'
                      } px-3 py-1 rounded-full text-sm`}
                    >
                      {capitalizeFirstLetter(profile.accountType)} Account
                    </span>
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      Score: {profile.score}
                    </span>
                    {profile.isPremium && (
                      <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                        Premium Member
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-green-400"
                    >
                      <Settings className="w-6 h-6" />
                    </Button>
                    <Button 
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                    >
                      <LogOut className="mr-2 w-5 h-5" /> Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistics and Information Grid */}
            <div className="grid md:grid-cols-3 gap-8 p-8">
              {/* Performance and Languages Column */}
              <div className="space-y-4">
                {/* Performance Card */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center">
                    <Trophy className="mr-2 w-6 h-6" /> Performance
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Global Rank</span>
                      <span className="font-bold text-green-400">#{profile.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Problems Solved</span>
                      <span className="font-bold text-green-400">{performance.problemsSolved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Accuracy</span>
                      <span className="font-bold text-green-400">{performance.accuracy}%</span>
                    </div>
                  </div>
                </div>

                {/* Languages Card */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center">
                    <Code className="mr-2 w-6 h-6" /> Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferredLanguages.length > 0 ? (
                      profile.preferredLanguages.map((lang, index) => (
                        <span 
                          key={index} 
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs"
                        >
                          {lang}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No languages set</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges Column */}
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center">
                    <Medal className="mr-2 w-6 h-6" /> Badges
                  </h3>
                  {achievements.badges.length > 0 ? (
                    <div className="space-y-2">
                      {achievements.badges.map((badge, index) => (
                        <div 
                          key={index} 
                          className="bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded-lg"
                        >
                          <p className="font-semibold">{badge.name}</p>
                          <p className="text-xs text-yellow-300">{badge.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No badges earned</p>
                  )}
                </div>
              </div>

              {/* Recent Activity Column */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center">
                  <Activity className="mr-2 w-6 h-6" /> Recent Activity
                </h3>
                {performance.recentActivity && performance.recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {performance.recentActivity.slice(0, 5).map((activity, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-700 p-2 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm text-gray-300">{activity.problemTitle}</p>
                          <span 
                            className={`
                              text-xs px-2 py-1 rounded-full 
                              ${activity.status === 'Accepted' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'}
                            `}
                          >
                            {activity.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;