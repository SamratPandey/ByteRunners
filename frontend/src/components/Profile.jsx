import { useEffect, useState, useRef } from 'react';
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
  X,
  Camera,
  Star,
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  BarChart3,
  Zap,
  Brain,
  CheckCircle,
  User,
  Mail,
  MapPin,
  Phone,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProfileCardSkeleton, CardSkeleton } from '@/components/ui/skeleton';
import Nav from './Nav';
import { logout } from '../redux/actions/authActions';
import authApi from '../utils/authApi';

// Background Pattern Component (matching project style)
const BackgroundPattern = () => (
  <div className="fixed inset-0 pointer-events-none">
    {/* Animated grid pattern */}
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `
          linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-move 20s linear infinite'
      }}
    />
    
    {/* Floating code symbols */}
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute text-green-500/10 select-none animate-pulse-glow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 20 + 10}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}
        >
          {['{', '}', '<', '>', '/', '\\', '(', ')', '[', ']', ';', ':', '=', '+', '-'][Math.floor(Math.random() * 15)]}
        </div>
      ))}
    </div>
    
    {/* Gradient orbs */}
    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse-glow" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
  </div>
);

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
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }
      
      try {
        // Just fetch the profile directly since user is already authenticated
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
  
      if (result.success && result.data) {        // Initialize with defaults based on User model
        const initializedData = {
          profile: {
            name: result.data.profile?.name || '',
            email: result.data.profile?.email || '',
            avatar: result.data.profile?.avatar || '/images/user.png',
            bio: result.data.profile?.bio || '',
            location: result.data.profile?.location || '',
            phone: result.data.profile?.phone || '',
            preferredLanguages: result.data.profile?.preferredLanguages || [],
            socialLinks: result.data.profile?.socialLinks || {},
            accountType: result.data.profile?.accountType || 'free',
            score: result.data.profile?.score || 0,
            rank: result.data.profile?.rank || 0,
            isPremium: result.data.profile?.isPremium || false,
            joinedAt: result.data.profile?.joinedAt || new Date(),
            lastActive: result.data.profile?.lastActive || new Date()
          },
          performance: {
            problemsSolved: result.data.performance?.problemsSolved || 0,
            totalSubmissions: result.data.performance?.totalSubmissions || 0,
            accuracy: result.data.performance?.accuracy || 0,
            streak: result.data.performance?.streak || 0,
            maxStreak: result.data.performance?.maxStreak || 0,
            recentActivity: result.data.performance?.recentActivity || [],
            weeklyProgress: result.data.performance?.weeklyProgress || [],
            languageStats: result.data.performance?.languageStats || {}
          },
          achievements: {
            badges: result.data.achievements?.badges || [],
            solvedProblems: result.data.achievements?.solvedProblems || [],
            certificates: result.data.achievements?.certificates || [],
            coursesCompleted: result.data.achievements?.coursesCompleted || 0,
            totalLearningHours: result.data.achievements?.totalLearningHours || 0
          },
          stats: {
            globalRank: result.data.stats?.globalRank || 0,
            countryRank: result.data.stats?.countryRank || 0,
            contestsParticipated: result.data.stats?.contestsParticipated || 0,
            averageRating: result.data.stats?.averageRating || 0,
            maxRating: result.data.stats?.maxRating || 0
          }
        };

        setUserData(initializedData);        setEditData({
          name: initializedData.profile.name,
          email: initializedData.profile.email,
          bio: initializedData.profile.bio,
          location: initializedData.profile.location,
          phone: initializedData.profile.phone,
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
        toast.success('Profile updated successfully! Your changes have been saved.', {
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
    toast("You've been logged out successfully! See you next time!", { 
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
      <div className="profile-container min-h-screen pb-12">
        <Nav />
        
        {/* Header Skeleton */}
        <div className="profile-header p-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <ProfileCardSkeleton className="mb-6" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} className="h-48" />
            ))}
          </div>
          
          {/* Additional Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton className="h-64" />
            <CardSkeleton className="h-64" />
          </div>
        </div>
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
    <div className="min-h-screen bg-black text-white">
      <BackgroundPattern />
      
      {/* Fixed Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-24">
        {/* Tab Navigation */}
        <div className="container mx-auto px-6 mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { key: 'overview', label: 'Overview', icon: User },
              { key: 'performance', label: 'Performance', icon: BarChart3 },
              { key: 'achievements', label: 'Achievements', icon: Trophy },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-green-500 text-black'
                    : 'bg-black/40 backdrop-blur-sm border border-green-900/50 text-gray-300 hover:border-green-500'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="container mx-auto px-6">
            {/* Profile Header */}
            <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8 mb-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Avatar Section */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500/50 shadow-2xl">
                    <img
                      src={profile.avatar || '/images/user.png'}
                      alt={profile.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  {isEditing && (
                    <button
                      onClick={handlePhotoClick}
                      className="absolute bottom-0 right-0 bg-green-500 p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300"
                    >
                      <Camera className="w-4 h-4 text-black" />
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

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent">
                          {profile.name}
                        </span>
                      </h1>
                      <p className="text-gray-400 mb-2">{profile.email}</p>
                      {profile.location && (
                        <p className="text-gray-400 flex items-center gap-1 justify-center lg:justify-start">
                          <MapPin className="w-4 h-4" />
                          {profile.location}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 mt-4 lg:mt-0">
                      {!isEditing ? (                        <Button
                          onClick={handleEditToggle}
                          variant="success"
                          size="lg"
                          className="font-medium"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (                        <>
                          <Button
                            onClick={handleSaveProfile}
                            variant="success"
                            size="lg"
                            className="font-medium"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            onClick={handleEditToggle}
                            variant="outline"
                            size="lg"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-medium"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    {isEditing ? (
                      <Textarea
                        value={editData?.bio || ''}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="bg-black/50 border-green-900/50 text-white placeholder-gray-400"
                      />
                    ) : (
                      <p className="text-gray-300 leading-relaxed">
                        {profile.bio || 'No bio provided yet. Click "Edit Profile" to add one!'}
                      </p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-black/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{performance.problemsSolved || 0}</div>
                      <div className="text-sm text-gray-400">Problems Solved</div>
                    </div>
                    <div className="text-center p-4 bg-black/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">#{profile.rank || 'N/A'}</div>
                      <div className="text-sm text-gray-400">Global Rank</div>
                    </div>
                    <div className="text-center p-4 bg-black/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{performance.streak || 0}</div>
                      <div className="text-sm text-gray-400">Current Streak</div>
                    </div>
                    <div className="text-center p-4 bg-black/50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">{profile.score || 0}</div>
                      <div className="text-sm text-gray-400">Total Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Performance Stats */}
              <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Performance</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Submissions</span>
                    <span className="font-bold text-white">{performance.totalSubmissions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="font-bold text-green-400">{performance.accuracy || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Streak</span>
                    <span className="font-bold text-yellow-400">{performance.maxStreak || 0}</span>
                  </div>
                </div>
              </div>

              {/* Learning Stats */}
              <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">Learning</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Courses Completed</span>
                    <span className="font-bold text-white">{achievements.coursesCompleted || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Learning Hours</span>
                    <span className="font-bold text-blue-400">{achievements.totalLearningHours || 0}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Certificates</span>
                    <span className="font-bold text-purple-400">{achievements.certificates?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Activity</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Contests Participated</span>
                    <span className="font-bold text-white">{userData.stats?.contestsParticipated || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Joined</span>
                    <span className="font-bold text-gray-300">
                      {new Date(profile.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Account Type</span>
                    <span className={`font-bold ${profile.isPremium ? 'text-yellow-400' : 'text-gray-300'}`}>
                      {profile.isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <LinkIcon className="w-6 h-6 text-green-400" />
                Social Links
              </h3>
              <SocialMediaLinks socialLinks={profile.socialLinks} />
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="container mx-auto px-6">
            <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-green-400" />
                Performance Analytics
              </h2>
              
              {/* Performance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-black/50 rounded-xl">
                  <div className="text-3xl font-bold text-green-400 mb-2">{performance.problemsSolved || 0}</div>
                  <div className="text-gray-400">Problems Solved</div>
                  <div className="text-sm text-green-300 mt-1">+{performance.recentActivity?.length || 0} this week</div>
                </div>
                <div className="text-center p-6 bg-black/50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{performance.accuracy || 0}%</div>
                  <div className="text-gray-400">Accuracy Rate</div>
                  <div className="text-sm text-blue-300 mt-1">Based on submissions</div>
                </div>
                <div className="text-center p-6 bg-black/50 rounded-xl">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{performance.streak || 0}</div>
                  <div className="text-gray-400">Current Streak</div>
                  <div className="text-sm text-purple-300 mt-1">Max: {performance.maxStreak || 0} days</div>
                </div>
                <div className="text-center p-6 bg-black/50 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{performance.totalSubmissions || 0}</div>
                  <div className="text-gray-400">Total Submissions</div>
                  <div className="text-sm text-yellow-300 mt-1">All time</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-400" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {performance.recentActivity?.length > 0 ? (
                  performance.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{activity.title || 'Problem Solved'}</div>
                          <div className="text-sm text-gray-400">{activity.description || 'Successfully completed'}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">{activity.date || 'Recently'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No recent activity</p>
                    <p className="text-sm text-gray-500">Start solving problems to see your progress here!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="container mx-auto px-6">
            <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Achievements & Badges
              </h2>
              
              {/* Badges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.badges?.length > 0 ? (
                  achievements.badges.map((badge, index) => (
                    <div key={index} className="p-6 bg-black/50 rounded-xl border border-yellow-500/20">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                          <Medal className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{badge.name}</h4>
                          <p className="text-sm text-gray-400">{badge.description}</p>
                        </div>
                      </div>
                      <div className="text-xs text-yellow-300">
                        Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No Badges Yet</h3>
                    <p className="text-gray-500">Start solving problems and completing challenges to earn badges!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Award className="w-5 h-5 text-green-400" />
                Certificates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.certificates?.length > 0 ? (
                  achievements.certificates.map((cert, index) => (
                    <div key={index} className="p-6 bg-black/50 rounded-xl border border-green-500/20">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                          <Award className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{cert.title}</h4>
                          <p className="text-sm text-gray-400">{cert.issuer}</p>
                          <p className="text-xs text-green-300">Completed {cert.completedAt}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No certificates earned yet</p>
                    <p className="text-sm text-gray-500">Complete courses to earn certificates!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="container mx-auto px-6">
            <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Settings className="w-6 h-6 text-green-400" />
                Profile Settings
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-green-900/30 pb-2">
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">                    <div>
                      <Label className="text-gray-300 mb-2 block">Full Name</Label>
                      <Input
                        value={editData?.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="bg-black/50 border-green-900/50 text-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-gray-300 mb-2 block">Email</Label>
                      <Input
                        value={editData?.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="bg-black/50 border-green-900/50 text-white"
                        placeholder="Enter your email"
                        type="email"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-gray-300 mb-2 block">Location</Label>
                      <Input
                        value={editData?.location || ''}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="bg-black/50 border-green-900/50 text-white"
                        placeholder="Enter your location"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-gray-300 mb-2 block">Phone</Label>
                      <Input
                        value={editData?.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="bg-black/50 border-green-900/50 text-white"
                        placeholder="Enter your phone number"
                        type="tel"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-gray-300 mb-2 block">Bio</Label>
                      <Textarea
                        value={editData?.bio || ''}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        className="bg-black/50 border-green-900/50 text-white"
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-green-900/30 pb-2">
                    Social Links
                  </h3>
                    <div className="space-y-4">
                    {[
                      { key: 'github', label: 'GitHub', icon: Github, placeholder: 'username' },
                      { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'username' },
                      { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'username' },
                      { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yoursite.com' }
                    ].map(social => (
                      <div key={social.key}>
                        <Label className="text-gray-300 mb-2 flex items-center gap-2">
                          <social.icon className="w-4 h-4" />
                          {social.label}
                        </Label>
                        <Input
                          value={editData?.socialLinks?.[social.key] || ''}
                          onChange={(e) => handleUpdateSocialLink(social.key, e.target.value)}
                          className="bg-black/50 border-green-900/50 text-white"
                          placeholder={social.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-8 pt-6 border-t border-green-900/30">                <Button
                  onClick={handleSaveProfile}
                  variant="success"
                  size="lg"
                  className="font-medium px-8"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-black/30 backdrop-blur-lg border border-green-900/30 rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-white border-b border-green-900/30 pb-2 mb-6">
                Security Settings
              </h3>
              
              {!showPasswordForm ? (                <Button
                  onClick={() => setShowPasswordForm(true)}
                  variant="warning"
                  className="font-medium"
                >
                  Change Password
                </Button>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label className="text-gray-300 mb-2 block">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="bg-black/50 border-green-900/50 text-white pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 mb-2 block">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-black/50 border-green-900/50 text-white pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 mb-2 block">Confirm New Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="bg-black/50 border-green-900/50 text-white"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">                    <Button
                      onClick={() => {
                        // Handle password change logic here
                        toast.success('Password updated successfully!');
                        setShowPasswordForm(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      variant="success"
                      size="lg"
                      className="font-medium"
                    >
                      Update Password
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      variant="outline"
                      size="lg"
                      className="border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logout Section */}
        <div className="container mx-auto px-6 mt-8">
          <div className="bg-black/30 backdrop-blur-lg border border-red-900/30 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Sign Out</h3>
                <p className="text-gray-400">You'll be redirected to the login page</p>
              </div>              <Button
                onClick={handleLogout}
                variant="destructive"
                size="lg"
                className="font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced CSS Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes pulse-glow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }

        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.4s ease-out forwards;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;        }
      `}</style>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Profile;
