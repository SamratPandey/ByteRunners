import React, { useEffect, useState, useRef } from 'react';
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
  Facebook,
  Edit3,
  Upload,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }

  .animate-slide-in {
    animation: slideIn 0.4s ease-out forwards;
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }
      
      try {
        // First verify the auth status
        const authResponse = await authApi.get('/api/auth/check-auth');
        if (!authResponse.data.success) {
          throw new Error('Authentication check failed');
        }
        
        // Then fetch the profile
        await fetchUserProfile();
      } catch (error) {
        if (error?.response?.status === 401) {
          dispatch(logout());
          // The interceptor will handle the redirect and toast
        } else {
          toast.error('Unable to load your profile data right now. Please check your connection and try again.', {
            style: {
              background: '#ef4444',
              color: 'white',
              fontWeight: '500'
            },
            duration: 4000
          });
        }
      }
    };
    
    checkAuthAndFetchProfile();
  }, [isAuthenticated, dispatch, navigate]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authApi.get('/api/auth/profile');
  
      const result = response.data;
  
      if (result.success && result.data) {
        // Initialize with defaults based on User model
        const initializedData = {
          profile: {
            name: result.data.profile?.name || '',
            avatar: result.data.profile?.avatar || '/images/user.png',
            bio: result.data.profile?.bio || '',
            preferredLanguages: result.data.profile?.preferredLanguages || [],
            socialLinks: result.data.profile?.socialLinks || {},
            accountType: result.data.profile?.accountType || 'free',
            score: result.data.profile?.score || 0,
            rank: result.data.profile?.rank || 0,
            isPremium: result.data.profile?.isPremium || false
          },
          performance: {
            problemsSolved: result.data.performance?.problemsSolved || 0,
            accuracy: result.data.performance?.accuracy || 0,
            recentActivity: result.data.performance?.recentActivity || []
          },
          achievements: {
            badges: result.data.achievements?.badges || [],
            solvedProblems: result.data.achievements?.solvedProblems || []
          }
        };

        setUserData(initializedData);
        setEditData({
          name: initializedData.profile.name,
          bio: initializedData.profile.bio,
          preferredLanguages: initializedData.profile.preferredLanguages,
          socialLinks: initializedData.profile.socialLinks
        });
      } else {
        throw new Error(result.message || 'Failed to fetch profile');
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        // Let the interceptor handle auth errors
        throw error;
      } else {
        toast.error('We\'re having trouble loading your profile data. Please refresh the page or try again later.', {
          style: {
            background: '#ef4444',
            color: 'white',
            fontWeight: '500'
          },
          duration: 4000
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or GIF format only).', {
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        },
        duration: 4000
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await authApi.post('/api/auth/update-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        await fetchUserProfile();
        toast.success('📸 Profile photo updated successfully! Looking great!', {
          style: {
            background: '#22c55e',
            color: 'white',
            fontWeight: '500'
          },
          duration: 3000
        });
      }
    } catch (error) {
      toast.error('Unable to update your profile photo right now. Please try again or contact support.', {
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        },
        duration: 4000
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    try {
      const response = await authApi.put('/api/auth/update-profile', editData);
      
      if (response.data.success) {
        await fetchUserProfile();
        setIsEditing(false);
        toast.success('✅ Profile updated successfully! Your changes have been saved.', {
          style: {
            background: '#22c55e',
            color: 'white',
            fontWeight: '500'
          },
          duration: 3000
        });
      }
    } catch (error) {
      toast.error('Unable to save your profile changes. Please check your information and try again.', {
        style: {
          background: '#ef4444',
          color: 'white',
          fontWeight: '500'
        },
        duration: 4000
      });
    }
  };

  const handleAddLanguage = (language) => {
    if (language && !editData.preferredLanguages.includes(language)) {
      setEditData({
        ...editData,
        preferredLanguages: [...editData.preferredLanguages, language]
      });
    }
  };

  const handleRemoveLanguage = (language) => {
    setEditData({
      ...editData,
      preferredLanguages: editData.preferredLanguages.filter(lang => lang !== language)
    });
  };

  const handleUpdateSocialLink = (platform, value) => {
    setEditData({
      ...editData,
      socialLinks: {
        ...editData.socialLinks,
        [platform]: value
      }
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    toast("👋 You've been logged out successfully! See you next time!", { 
      icon: '✅',
      style: {
        background: '#22c55e',
        color: 'white',
        fontWeight: '500'
      },
      duration: 3000
    });
    navigate('/login', { replace: true });
  };

  // Initialize profile data with required default values
  const defaultData = {
    profile: {
      name: '',
      avatar: '/images/user.png',
      bio: '',
      preferredLanguages: [],
      socialLinks: {},
      accountType: 'free',
      score: 0,
      rank: 0,
      isPremium: false
    },
    performance: {
      problemsSolved: 0,
      accuracy: 0,
      recentActivity: []
    },
    achievements: {
      badges: [],
      solvedProblems: []
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse w-16 h-16 bg-green-500 rounded-full" />
      </div>
    );
  }

  if (!userData?.profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400">Error loading profile data</div>
      </div>
    );
  }

  const profile = { ...defaultData.profile, ...userData.profile };
  const performance = { ...defaultData.performance, ...userData.performance };
  const achievements = { ...defaultData.achievements, ...userData.achievements };

  return (
    <div className="profile-container min-h-screen pb-12">
      <Nav />
      
      {/* Hero Section with Avatar */}
      <div className="profile-header p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="profile-avatar-container relative group">
              <div className="profile-avatar w-32 h-32 rounded-full overflow-hidden">
                <img
                  src={profile.avatar || '/images/user.png'}
                  alt={profile.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onClick={handlePhotoClick}
                />
              </div>
              {isEditing && (
                <button
                  onClick={handlePhotoClick}
                  className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full shadow-lg hover:bg-emerald-600 transition-all duration-300"
                >
                  <Upload className="w-4 h-4 text-white" />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
              />
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
                  {profile.name}
                </h1>
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-300"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleEditToggle}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEditToggle}
                      className="bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-gray-300 text-lg animate-fade-in">
                {profile.bio || 'No bio provided'}
              </p>

              <div className="flex flex-wrap gap-3 animate-fade-in">
                {profile.preferredLanguages?.map((lang) => (
                  <span key={lang} className="language-tag px-4 py-2 rounded-full text-sm text-emerald-400">
                    {lang}
                  </span>
                ))}
              </div>

              <SocialMediaLinks socialLinks={profile.socialLinks} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="stat-card rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <Trophy className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Performance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Problems Solved</span>
                <span className="metric-value">{performance.problemsSolved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Accuracy</span>
                <span className="metric-value">{performance.accuracy}%</span>
              </div>
            </div>
          </div>

          <div className="stat-card rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Rankings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Global Rank</span>
                <span className="metric-value">#{profile.rank || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Score</span>
                <span className="metric-value">{profile.score}</span>
              </div>
            </div>
          </div>

          <div className="stat-card rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Activity</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">This Week</span>
                <span className="metric-value">{performance.recentActivity?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Account Type</span>
                <span className="metric-value capitalize">{profile.accountType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white">Achievements</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.badges?.map((badge, index) => (
              <div key={index} className="badge-item rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Medal className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{badge.name}</h4>
                    <p className="text-sm text-gray-400">{badge.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
          </div>
          <div className="space-y-4">
            {performance.recentActivity?.map((activity, index) => (
              <div key={index} className="activity-item rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-emerald-500/10">
                      <Code className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{activity.title}</h4>
                      <p className="text-sm text-gray-400">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {activity.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
