import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Book, 
  Clock, 
  Star, 
  Play, 
  MoreVertical, 
  Award, 
  TrendingUp,
  Calendar,
  Users,
  BookOpen,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Nav from './Nav';
import authApi from '../utils/authApi';

const MyCourses = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserCourses();
  }, [isAuthenticated, navigate]);  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch user's enrolled and purchased courses
      try {
        const coursesResponse = await authApi.get('/api/course/user/enrolled');
        
        const { enrolledCourses, purchasedCourses } = coursesResponse.data.data;
        setEnrolledCourses(enrolledCourses || []);
        setPurchasedCourses(purchasedCourses || []);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setEnrolledCourses([]);
        setPurchasedCourses([]);
      }
      
      // Fetch wishlist
      try {
        const wishlistResponse = await authApi.get('/api/course/user/wishlist');
        setWishlist(wishlistResponse.data.courses || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error fetching user courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const RatingStars = ({ rating }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
          />
        ))}
      </div>
    );
  };

  const CourseCard = ({ course, showProgress = false }) => (
    <Card className="bg-black/40 backdrop-blur-xl border border-green-900/50 hover:border-green-500 transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img 
          src={course.course?.thumbnail || course.thumbnail} 
          alt={course.course?.title || course.title}
          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <Button 
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          size="sm"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
        
        {showProgress && course.progress !== undefined && (
          <div className="absolute bottom-4 left-4 right-4">
            <Progress value={course.progress} className="h-2 bg-black/50" />
            <p className="text-white text-sm mt-1">{course.progress}% Complete</p>
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors duration-300 line-clamp-2 mb-2">
            {course.course?.title || course.title}
          </h3>
          
          <p className="text-gray-400 text-sm line-clamp-2 mb-3">
            {course.course?.subtitle || course.subtitle}
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-300 text-sm">
              by {course.course?.instructor?.name || course.instructor?.name}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration((course.course?.totalDuration || course.totalDuration) || 0)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{(course.course?.totalLessons || course.totalLessons) || 0} lessons</span>
            </div>
          </div>
          
          <RatingStars rating={(course.course?.averageRating || course.averageRating) || 0} />
        </div>
        
        <div className="flex gap-2 pt-4 border-t border-green-900/30">
          <Button 
            onClick={() => navigate(`/learn/${course.course?._id || course._id}`)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            {showProgress ? 'Continue Learning' : 'Start Learning'}
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            onClick={() => navigate(`/course-details/${course.course?._id || course._id}`)}
          >
            Details
          </Button>
        </div>
      </div>
    </Card>
  );

  const WishlistCard = ({ course }) => (
    <Card className="bg-black/40 backdrop-blur-xl border border-green-900/50 hover:border-green-500 transition-all duration-300 overflow-hidden group">
      <div className="flex gap-4 p-4">
        <img 
          src={course.course.thumbnail} 
          alt={course.course.title}
          className="w-32 h-20 object-cover rounded-lg"
        />
        
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-bold text-white line-clamp-1">
            {course.course.title}
          </h3>
          
          <p className="text-gray-400 text-sm line-clamp-1">
            by {course.course.instructor.name}
          </p>
          
          <div className="flex items-center gap-4">
            <RatingStars rating={course.course.averageRating} />
            <span className="text-green-400 font-semibold">
              {course.course.isFree ? 'Free' : `₹${course.course.price}`}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigate(`/course-details/${course.course._id}`)}
          >
            View Course
          </Button>
          
          <Button 
            size="sm"
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            Remove
          </Button>
        </div>
      </div>
    </Card>
  );

  const EmptyState = ({ title, description, actionText, actionClick }) => (
    <div className="text-center py-20">
      <BookOpen className="mx-auto h-16 w-16 text-gray-600 mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      {actionText && actionClick && (
        <Button 
          onClick={actionClick}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {actionText}
        </Button>
      )}
    </div>
  );

  const BackgroundPattern = () => (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, 
            rgba(22, 163, 74, 0.4) 0%,
            rgba(22, 163, 74, 0.1) 20%,
            rgba(0, 0, 0, 0.2) 50%,
            rgba(0, 0, 0, 0.8) 100%)
          `
        }}
      />
      <div className="absolute inset-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(22, 163, 74, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(22, 163, 74, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <BackgroundPattern />
        <Nav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <BackgroundPattern />
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>

      <main className="relative z-10 pt-24">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent">
                My Learning
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              Continue your learning journey and track your progress
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your courses..."
                className="w-full bg-black/40 border border-green-900/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="bg-black/40 border border-green-900/50 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Recently Accessed</option>
              <option value="progress">Progress</option>
              <option value="alphabetical">A-Z</option>
              <option value="purchased">Recently Purchased</option>
            </select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-black/50 border border-green-900/50 mb-8">
              <TabsTrigger value="enrolled" className="data-[state=active]:bg-green-600">
                Enrolled Courses ({enrolledCourses.length})
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="data-[state=active]:bg-green-600">
                Wishlist ({wishlist.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-green-600">
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enrolled" className="space-y-6">
              {enrolledCourses.length === 0 ? (
                <EmptyState 
                  title="No Enrolled Courses"
                  description="You haven't enrolled in any courses yet. Start your learning journey today!"
                  actionText="Browse Courses"
                  actionClick={() => navigate('/courses')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <CourseCard key={course._id || course.course._id} course={course} showProgress={true} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-6">
              {wishlist.length === 0 ? (
                <EmptyState 
                  title="No Courses in Wishlist"
                  description="Save courses for later by adding them to your wishlist."
                  actionText="Browse Courses"
                  actionClick={() => navigate('/courses')}
                />
              ) : (
                <div className="space-y-4">
                  {wishlist.map((course) => (
                    <WishlistCard key={course._id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <EmptyState 
                title="No Completed Courses"
                description="Complete your enrolled courses to see them here and earn certificates."
                actionText="Continue Learning"
                actionClick={() => setActiveTab('enrolled')}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MyCourses;