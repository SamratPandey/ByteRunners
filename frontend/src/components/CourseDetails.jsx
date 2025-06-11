import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  Star, 
  Clock, 
  Calendar, 
  Users, 
  Award, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  FileText, 
  HelpCircle,
  Download,
  Check,
  ChevronRight,
  MessageSquare,
  Video,
  Facebook,
  Twitter,
  Linkedin as LinkedinIcon,
  Heart,
  ShoppingCart,
  Share2,
  Globe,
  Smartphone,
  Trophy,
  Infinity,
  Tag,
  User,
  Star as StarIcon,
  ThumbsUp,
  MoreHorizontal,
  PlayCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Nav from './Nav';
import PaymentModal from './PaymentModal';
import axios from 'axios';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const [course, setCourse] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [selectedReviewSort, setSelectedReviewSort] = useState('newest');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const headers = {};
        if (isAuthenticated) {
          headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
        }
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/course/${courseId}`,
          { headers }
        );
        
        setCourse(response.data.course);
        setUserInfo(response.data.userInfo);
        setRelatedCourses(response.data.relatedCourses);
        setLoading(false);
      } catch (err) {
        setError('Failed to load course details');
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, isAuthenticated]);
  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to purchase this course');
      navigate('/login');
      return;
    }

    if (course.isFree) {
      // Handle free course enrollment directly
      setPurchasing(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/course/purchase`,
          {
            courseId: course._id,
            paymentDetails: {
              method: 'free',
              paymentId: 'free_' + Date.now(),
            }
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );

        toast.success('Successfully enrolled in the course!');
        setUserInfo(prev => ({ ...prev, isPurchased: true, isEnrolled: true }));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to enroll in course');
      } finally {
        setPurchasing(false);
      }
    } else {
      // Show payment modal for paid courses
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setUserInfo(prev => ({ ...prev, isPurchased: true, isEnrolled: true }));
    setShowPaymentModal(false);
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add to wishlist');
      navigate('/login');
      return;
    }

    setAddingToWishlist(true);
    try {
      if (userInfo?.isInWishlist) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/course/wishlist/${course._id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        toast.success('Removed from wishlist');
        setUserInfo(prev => ({ ...prev, isInWishlist: false }));
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/course/wishlist`,
          { courseId: course._id },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        toast.success('Added to wishlist');
        setUserInfo(prev => ({ ...prev, isInWishlist: true }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const formatPrice = (price, isFree) => {
    if (isFree) return 'Free';
    return `₹${price.toFixed(2)}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const RatingStars = ({ rating, size = 4 }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            className={`w-${size} h-${size} ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
          />
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }) => (
    <div className="bg-black/30 backdrop-blur-sm border border-green-900/30 rounded-lg p-6 mb-4">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={review.user.avatar} />
          <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white">{review.user.name}</span>
            {review.isVerifiedPurchase && (
              <Badge className="bg-green-600 text-white text-xs">Verified Purchase</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <RatingStars rating={review.rating} />
            <span className="text-sm text-gray-400">
              {new Date(review.ratedAt).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-gray-300 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Nav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Nav />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {error || 'Course not found'}
            </h2>
            <Button 
              onClick={() => navigate('/courses')} 
              className="bg-green-600 hover:bg-green-700"
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Badge className="bg-green-500/10 text-green-500 mb-2">
                  {course.category}
                </Badge>
                {course.bestseller && (
                  <Badge className="bg-yellow-500/10 text-yellow-500 ml-2">
                    Bestseller
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>
              
              {course.subtitle && (
                <p className="text-xl text-gray-300 mb-6">{course.subtitle}</p>
              )}
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <RatingStars rating={course.averageRating} size={5} />
                  <span className="text-yellow-400 font-semibold">
                    {course.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-400">
                    ({course.totalReviews} reviews)
                  </span>
                </div>
                
                <div className="flex items-center gap-1 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{course.totalEnrollments} students</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={course.instructor.avatar} />
                    <AvatarFallback>
                      {course.instructor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-green-400 hover:text-green-300 cursor-pointer">
                    {course.instructor.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {new Date(course.lastUpdated).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <Globe className="w-4 h-4" />
                  <span>{course.language}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(course.totalDuration)} total</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <PlayCircle className="w-4 h-4" />
                  <span>{course.totalLessons} lessons</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.totalSections} sections</span>
                </div>
                
                <Badge className={`${course.level === 'beginner' ? 'bg-emerald-500/20 text-emerald-400' : 
                  course.level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' : 
                  'bg-purple-500/20 text-purple-400'}`}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
              </div>
              
              {/* Course Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {course.lifetime_access && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Infinity className="w-4 h-4" />
                    <span className="text-sm">Lifetime access</span>
                  </div>
                )}
                
                {course.mobile_access && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm">Mobile access</span>
                  </div>
                )}
                
                {course.hasCertificate && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">Certificate</span>
                  </div>
                )}
                
                {course.hasSubtitles && (
                  <div className="flex items-center gap-2 text-green-400">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Subtitles</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Sidebar - Course Card */}
            <div className="lg:col-span-1">
              <Card className="bg-black/50 backdrop-blur-xl border border-green-900/50 p-6 sticky top-6">
                <div className="relative mb-6">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  {course.previewVideo && (
                    <button className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/70 transition-colors rounded-lg group">
                      <Play className="w-16 h-16 text-white group-hover:text-green-400 transition-colors" />
                    </button>
                  )}
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="text-2xl text-gray-400 line-through">
                        ₹{course.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-white">
                      {formatPrice(course.price, course.isFree)}
                    </span>
                    {course.discountPercentage > 0 && (
                      <Badge className="bg-red-500 text-white">
                        {course.discountPercentage}% off
                      </Badge>
                    )}
                  </div>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <p className="text-sm text-green-400">
                      Save ₹{(course.originalPrice - course.price).toFixed(2)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3 mb-6">
                  {userInfo?.isPurchased ? (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                      onClick={() => navigate(`/learn/${course._id}`)}
                    >
                      Go to Course
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                      onClick={handlePurchase}
                      disabled={purchasing}
                    >
                      {purchasing ? 'Processing...' : course.isFree ? 'Enroll Now' : 'Buy Now'}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    onClick={handleAddToWishlist}
                    disabled={addingToWishlist}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${userInfo?.isInWishlist ? 'fill-current' : ''}`} />
                    {userInfo?.isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-400">
                  <p>30-Day Money-Back Guarantee</p>
                  <p>Full Lifetime Access</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-black/50 border border-green-900/50 w-full justify-start mb-8">
                <TabsTrigger value="overview" className="data-[state=active]:bg-green-600">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="curriculum" className="data-[state=active]:bg-green-600">
                  Curriculum
                </TabsTrigger>
                <TabsTrigger value="instructor" className="data-[state=active]:bg-green-600">
                  Instructor
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-green-600">
                  Reviews
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-8">
                {/* What you'll learn */}
                <Card className="bg-black/30 backdrop-blur-sm border border-green-900/30 p-6">
                  <h3 className="text-2xl font-bold mb-4">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.whatYouWillLearn?.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                
                {/* Course Description */}
                <Card className="bg-black/30 backdrop-blur-sm border border-green-900/30 p-6">
                  <h3 className="text-2xl font-bold mb-4">Description</h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {course.description}
                    </p>
                  </div>
                </Card>
                
                {/* Prerequisites */}
                {course.prerequisites?.length > 0 && (
                  <Card className="bg-black/30 backdrop-blur-sm border border-green-900/30 p-6">
                    <h3 className="text-2xl font-bold mb-4">Prerequisites</h3>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <ChevronRight className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                
                {/* Target Audience */}
                {course.targetAudience?.length > 0 && (
                  <Card className="bg-black/30 backdrop-blur-sm border border-green-900/30 p-6">
                    <h3 className="text-2xl font-bold mb-4">Who is this course for</h3>
                    <ul className="space-y-2">
                      {course.targetAudience.map((audience, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <User className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{audience}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="curriculum" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4">Course Content</h3>
                  <p className="text-gray-400">
                    {course.totalSections} sections • {course.totalLessons} lessons • {formatDuration(course.totalDuration)} total length
                  </p>
                </div>
                
                <div className="space-y-4">
                  {course.curriculum?.map((section, index) => (
                    <Card key={section._id || index} className="bg-black/30 backdrop-blur-sm border border-green-900/30">
                      <div 
                        className="p-4 cursor-pointer hover:bg-green-900/10 transition-colors"
                        onClick={() => toggleSection(section._id || index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedSections[section._id || index] ? 
                              <ChevronUp className="w-5 h-5 text-green-400" /> : 
                              <ChevronDown className="w-5 h-5 text-green-400" />
                            }
                            <h4 className="font-semibold text-white">{section.title}</h4>
                          </div>
                          <div className="text-sm text-gray-400">
                            {section.lessons?.length || 0} lessons
                          </div>
                        </div>
                        {section.description && (
                          <p className="text-gray-400 text-sm mt-2 ml-8">{section.description}</p>
                        )}
                      </div>
                      
                      {expandedSections[section._id || index] && (
                        <div className="border-t border-green-900/30">
                          {section.lessons?.map((lesson, lessonIndex) => (
                            <div key={lesson._id || lessonIndex} className="p-4 border-b border-green-900/20 last:border-b-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {lesson.type === 'video' && <Video className="w-4 h-4 text-blue-400" />}
                                  {lesson.type === 'article' && <FileText className="w-4 h-4 text-green-400" />}
                                  {lesson.type === 'quiz' && <HelpCircle className="w-4 h-4 text-purple-400" />}
                                  
                                  <span className="text-gray-300">{lesson.title}</span>
                                  
                                  {lesson.isPreview && (
                                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">Preview</Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  {lesson.duration && (
                                    <span>{formatDuration(lesson.duration)}</span>
                                  )}
                                  {lesson.isPreview && (
                                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                                      Preview
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="instructor" className="space-y-6">
                <Card className="bg-black/30 backdrop-blur-sm border border-green-900/30 p-6">
                  <div className="flex items-start gap-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={course.instructor.avatar} />
                      <AvatarFallback className="text-2xl">
                        {course.instructor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{course.instructor.name}</h3>
                      {course.instructor.bio && (
                        <p className="text-gray-300 leading-relaxed">{course.instructor.bio}</p>
                      )}
                      
                      {course.instructor.socialLinks && (
                        <div className="flex items-center gap-4 mt-4">
                          {course.instructor.socialLinks.website && (
                            <a href={course.instructor.socialLinks.website} target="_blank" rel="noopener noreferrer">
                              <Globe className="w-5 h-5 text-gray-400 hover:text-green-400 transition-colors" />
                            </a>
                          )}
                          {course.instructor.socialLinks.linkedin && (
                            <a href={course.instructor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                              <LinkedinIcon className="w-5 h-5 text-gray-400 hover:text-green-400 transition-colors" />
                            </a>
                          )}
                          {course.instructor.socialLinks.twitter && (
                            <a href={course.instructor.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="w-5 h-5 text-gray-400 hover:text-green-400 transition-colors" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4">Student Reviews</h3>
                  
                  {/* Rating Summary */}
                  <Card className="bg-black/30 backdrop-blur-sm border border-green-900/30 p-6 mb-6">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-400 mb-2">
                          {course.averageRating.toFixed(1)}
                        </div>
                        <RatingStars rating={course.averageRating} size={6} />
                        <p className="text-gray-400 text-sm mt-1">Course Rating</p>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => (
                          <div key={rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-16">
                              <span className="text-sm">{rating}</span>
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            </div>
                            <div className="flex-1 bg-gray-800 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ 
                                  width: `${course.totalReviews > 0 ? (course.ratingBreakdown[rating] / course.totalReviews) * 100 : 0}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-400 w-8">
                              {course.ratingBreakdown[rating] || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Reviews List */}
                <div className="space-y-4">
                  {course.reviews?.slice(0, showAllReviews ? undefined : 5).map((review, index) => (
                    <ReviewCard key={review._id || index} review={review} />
                  ))}
                  
                  {course.reviews?.length > 5 && (
                    <Button 
                      variant="outline" 
                      className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                    >
                      {showAllReviews ? 'Show Less' : `Show All ${course.reviews.length} Reviews`}
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Related Courses Sidebar */}
          <div className="lg:col-span-1">
            {relatedCourses?.length > 0 && (
              <Card className="bg-black/30 backdrop-blur-sm border border-green-900/30 p-6">
                <h3 className="text-xl font-bold mb-4">Related Courses</h3>
                <div className="space-y-4">
                  {relatedCourses.map(relatedCourse => (
                    <div 
                      key={relatedCourse._id}
                      className="flex gap-3 cursor-pointer hover:bg-green-900/10 p-2 rounded-lg transition-colors"
                      onClick={() => navigate(`/course-details/${relatedCourse._id}`)}
                    >
                      <img 
                        src={relatedCourse.thumbnail} 
                        alt={relatedCourse.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                          {relatedCourse.title}
                        </h4>
                        <p className="text-xs text-gray-400 mb-1">
                          by {relatedCourse.instructor.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <RatingStars rating={relatedCourse.averageRating} size={3} />
                          <span className="text-green-400 font-semibold text-sm">
                            {formatPrice(relatedCourse.price, relatedCourse.isFree)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={course}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default CourseDetails;