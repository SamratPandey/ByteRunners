import React, { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
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
  Linkedin as LinkedinIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import Nav from './Nav';

const CourseDetails = () => {
   const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('curriculum');
  const [videoModalOpen, setVideoModalOpen] = useState(false);


  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        
        
        setTimeout(() => {
          setCourse(mockCourse);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load course details');
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourseDetails();
    }
  }, [slug]);

  // Initialize expanded sections to show first section open
  useEffect(() => {
    if (course && course.curriculum) {
      const initialExpandedSections = {};
      initialExpandedSections[course.curriculum[0].title] = true;
      setExpandedSections(initialExpandedSections);
    }
  }, [course]);

  // Toggle section expansion
  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  // Format minutes to hours and minutes
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  // Calculate total course duration
  const calculateTotalDuration = (curriculum) => {
    let totalMinutes = 0;
    curriculum.forEach(section => {
      section.lessons.forEach(lesson => {
        totalMinutes += lesson.duration || 0;
      });
    });
    return formatDuration(totalMinutes);
  };

  // Count total lessons
  const countTotalLessons = (curriculum) => {
    return curriculum.reduce((total, section) => total + section.lessons.length, 0);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Enhanced background pattern component
  const BackgroundPattern = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          background: `
            radial-gradient(circle at 50% 30%, 
            rgba(22, 163, 74, 0.4) 0%,
            rgba(22, 163, 74, 0.1) 20%,
            rgba(0, 0, 0, 0.2) 50%,
            rgba(0, 0, 0, 0.8) 100%)
          `
        }}
      />
      
      {/* Animated Grid */}
      <div className="absolute inset-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(22, 163, 74, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(22, 163, 74, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Glowing Orbs */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-screen animate-pulse-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 400 + 200}px`,
              height: `${Math.random() * 400 + 200}px`,
              background: `radial-gradient(circle, 
                rgba(34, 197, 94, ${0.2 + Math.random() * 0.3}) 0%, 
                rgba(16, 185, 129, ${0.1 + Math.random() * 0.2}) 30%, 
                rgba(0, 0, 0, 0) 70%)
              `,
              filter: 'blur(60px)'
            }}
          />
        ))}
      </div>

      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
          backgroundSize: '150px 150px'
        }}
      />
    </div>
  );

  // Level badge color mapping
  const getLevelColor = (level) => {
    switch(level) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-400';
      case 'intermediate': return 'bg-blue-500/20 text-blue-400';
      case 'advanced': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Lesson icon based on type
  const LessonTypeIcon = ({ type }) => {
    switch(type) {
      case 'video':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'article':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  // Rating stars component
  const RatingStars = ({ rating, size = 'small' }) => {
    const starSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            className={`${starSize} ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
          />
        ))}
        <span className={`ml-2 text-gray-400 ${size === 'small' ? 'text-sm' : 'text-base'}`}>
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  // Video modal component
  const VideoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-black border border-green-900 rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-green-900">
            <h3 className="text-lg font-bold text-white">Course Preview</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="aspect-video bg-black/50">
            {/* Replace with actual video player */}
            <div className="w-full h-full flex items-center justify-center">
              <img src="/api/placeholder/1200/675" alt="Video thumbnail" className="max-w-full max-h-full" />
              <Play className="absolute w-16 h-16 text-green-500 opacity-80" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <BackgroundPattern />
        
        {/* Navigation */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
          <Nav />
        </div>

        {/* Loading state */}
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <BackgroundPattern />
        
        {/* Navigation */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
          <Nav />
        </div>

        {/* Error state */}
        <div className="flex-1 flex items-center justify-center pt-24">
          <Alert className="bg-red-500/10 border-red-500 text-red-500 max-w-md">
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <BackgroundPattern />
      
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>

      {/* Video Modal */}
      <VideoModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />

      {/* Course Header */}
      <div className="pt-24 pb-8 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Course Thumbnail and Preview */}
            <div className="w-full md:w-3/5">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black/40 backdrop-blur-md border border-green-900/50 group cursor-pointer" onClick={() => setVideoModalOpen(true)}>
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-green-600/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-medium">Preview this course</p>
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="w-full md:w-2/5">
              <Badge className={`px-3 py-1 mb-4 ${getLevelColor(course.level)}`}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Badge>
              
              <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>
              
              <p className="text-gray-400 mb-6">{course.summary}</p>
              
              <div className="flex items-center mb-4">
                <RatingStars rating={course.averageRating} size="large" />
                <span className="ml-2 text-gray-400">({course.totalRatings} ratings)</span>
              </div>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-300">{course.totalStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-300">Last updated {formatDate(course.lastUpdated)}</span>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <img 
                  src={course.instructor.avatar} 
                  alt={course.instructor.name} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="text-white font-medium">{course.instructor.name}</p>
                  <p className="text-gray-400 text-sm">Course Instructor</p>
                </div>
              </div>
              
              {/* Price and Enrollment */}
              <Card className="bg-black/40 backdrop-blur-xl border border-green-900/50 p-6 mb-6">
                {course.discountPrice && (
                  <div className="mb-4">
                    <div className="flex items-center mb-1">
                      <span className="text-3xl font-bold text-green-500">${course.discountPrice.toFixed(2)}</span>
                      <span className="ml-3 text-lg text-gray-400 line-through">${course.price.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {course.discountEnds && (
                        <span>Sale ends {formatDate(course.discountEnds)}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {!course.discountPrice && (
                  <div className="text-3xl font-bold text-green-500 mb-4">
                    {course.isFree ? 'Free' : `$${course.price.toFixed(2)}`}
                  </div>
                )}
                
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 mb-4">
                  {course.isFree ? 'Enroll Now' : 'Buy Now'}
                </Button>
                
                <div className="text-center text-gray-400 text-sm mb-4">
                  30-Day Money-Back Guarantee
                </div>
                
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-green-500 mr-3" />
                    <span>{calculateTotalDuration(course.curriculum)} total length</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-green-500 mr-3" />
                    <span>{countTotalLessons(course.curriculum)} lessons</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-green-500 mr-3" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="flex-1 relative z-10 bg-black/40 backdrop-blur-md border-t border-green-900/30">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Area */}
            <div className="w-full lg:w-8/12">
              {/* Tabs Navigation */}
              <div className="border-b border-green-900/50 mb-8">
                <div className="flex overflow-x-auto">
                  {['curriculum', 'overview', 'instructor', 'reviews', 'faq'].map((tab) => (
                    <button
                      key={tab}
                      className={`px-6 py-4 font-medium text-lg whitespace-nowrap transition-colors ${
                        activeTab === tab
                          ? 'text-green-500 border-b-2 border-green-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'curriculum' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>
                  
                  <div className="mb-4 flex flex-wrap gap-4 text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{calculateTotalDuration(course.curriculum)} total length</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      <span>{countTotalLessons(course.curriculum)} lessons</span>
                    </div>
                    <div className="flex items-center">
                      <Play className="w-5 h-5 mr-2" />
                      <span>{course.curriculum.reduce((count, section) => 
                        count + section.lessons.filter(l => l.isPreview).length, 0)} previews available</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {course.curriculum.map((section, sIndex) => (
                      <div 
                        key={sIndex}
                        className="border border-green-900/50 rounded-lg overflow-hidden bg-black/40"
                      >
                        {/* Section Header */}
                        <div 
                          className="flex justify-between items-center p-6 cursor-pointer hover:bg-green-900/10"
                          onClick={() => toggleSection(section.title)}
                        >
                          <div className="flex-1">
                            <h3 className="text-xl font-medium text-white">{section.title}</h3>
                            <p className="text-gray-400">
                              {section.lessons.length} lessons • 
                              {formatDuration(section.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0))}
                            </p>
                          </div>
                          {expandedSections[section.title] ? (
                            <ChevronUp className="w-6 h-6 text-green-500" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-green-500" />
                          )}
                        </div>
                        
                        {/* Section Lessons */}
                        {expandedSections[section.title] && (
                          <div className="border-t border-green-900/30">
                            {section.lessons.map((lesson, lIndex) => (
                              <div 
                                key={lIndex}
                                className={`p-6 flex items-center ${
                                  lIndex < section.lessons.length - 1 ? 'border-b border-green-900/30' : ''
                                } hover:bg-green-900/10`}
                              >
                                <LessonTypeIcon type={lesson.type} />
                                
                                <div className="ml-4 flex-1">
                                  <div className="flex items-center">
                                    <h4 className="text-white">{lesson.title}</h4>
                                    {lesson.isPreview && (
                                      <Badge className="ml-3 bg-green-500/10 text-green-500">
                                        Preview
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {lesson.type === 'article' && lesson.downloadableResources && (
                                    <div className="mt-2 text-sm text-gray-400">
                                    <div className="flex items-center space-x-4">
                                        <Download className="w-4 h-4" />
                                        <span>{lesson.downloadableResources.length} downloadable resources</span>
                                    </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-gray-400 text-sm">
                                  {formatDuration(lesson.duration)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">About This Course</h2>
                  
                  <div className="prose prose-invert prose-emerald max-w-none mb-8">
                    <p className="text-gray-300">{course.description}</p>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">What You'll Learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {course.learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{outcome}</span>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">Prerequisites</h3>
                  <div className="space-y-3 mb-8">
                    {course.prerequisites.map((prerequisite, index) => (
                      <div key={index} className="flex">
                        <ChevronRight className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{prerequisite}</span>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">This Course Is For:</h3>
                  <div className="space-y-3 mb-8">
                    <div className="flex">
                      <ChevronRight className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">Beginners who want to learn JavaScript from scratch</span>
                    </div>
                    <div className="flex">
                      <ChevronRight className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">Web developers looking to strengthen their JS fundamentals</span>
                    </div>
                    <div className="flex">
                      <ChevronRight className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">Anyone interested in frontend web development</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'instructor' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Your Instructor</h2>
                  
                  <div className="flex flex-col md:flex-row mb-8">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      <img 
                        src={course.instructor.avatar} 
                        alt={course.instructor.name}
                        className="w-32 h-32 rounded-full border-2 border-green-500"
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{course.instructor.name}</h3>
                      
                      <div className="flex flex-wrap gap-4 text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 mr-2" />
                          <span>{course.instructor.rating} Instructor Rating</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-5 h-5 mr-2" />
                          <span>328 Reviews</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          <span>{course.instructor.totalStudents.toLocaleString()} Students</span>
                        </div>
                        <div className="flex items-center">
                          <Video className="w-5 h-5 mr-2" />
                          <span>{course.instructor.totalCourses} Courses</span>
                        </div>
                      </div>
                      
                      <div className="prose prose-invert prose-emerald max-w-none">
                        <p className="text-gray-300">{course.instructor.bio}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Student Reviews</h2>
                  
                  <div className="mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-white mb-2">{course.averageRating.toFixed(1)}</div>
                        <RatingStars rating={course.averageRating} size="large" />
                        <div className="text-gray-400 mt-2">Course Rating</div>
                      </div>
                      
                      <div className="flex-1 w-full">
                        {[5, 4, 3, 2, 1].map(stars => {
                          // Calculate percentage of reviews with this star rating
                          const reviewsWithRating = course.reviews ? 
                            course.reviews.filter(r => Math.floor(r.rating) === stars).length : 0;
                          const percentage = course.reviews ? 
                            (reviewsWithRating / course.reviews.length) * 100 : 0;
                          
                          return (
                            <div key={stars} className="flex items-center mb-2">
                              <div className="text-gray-400 w-6">{stars}</div>
                              <Star className="w-4 h-4 text-yellow-400 mx-2" />
                              <div className="flex-1">
                                <Progress value={percentage} className="h-2" />
                              </div>
                              <div className="text-gray-400 ml-2 w-10">
                                {percentage.toFixed(0)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {course.reviews && course.reviews.map((review, index) => (
                        <div key={index} className="border-b border-green-900/30 pb-6">
                          <div className="flex items-start">
                            <img 
                              src={review.user.avatar} 
                              alt={review.user.name}
                              className="w-10 h-10 rounded-full mr-4"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="text-white font-medium">{review.user.name}</h4>
                                <RatingStars rating={review.rating} />
                                <span className="text-gray-400 text-sm">
                                  {formatDate(review.ratedAt)}
                                </span>
                              </div>
                              <p className="text-gray-300">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button variant="outline" className="border-green-600 text-green-500 hover:bg-green-600/10">
                        Show More Reviews
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                  
                  <div className="space-y-6 mb-8">
                    {course.faqs && course.faqs.map((faq, index) => (
                      <div key={index} className="border border-green-900/50 rounded-lg bg-black/40 p-6">
                        <h3 className="text-lg font-medium text-white mb-2">{faq.question}</h3>
                        <p className="text-gray-300">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Sidebar Content */}
            <div className="w-full lg:w-4/12">
              <Card className="bg-black/40 backdrop-blur-xl border border-green-900/50 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-6">Share this course</h3>
                
                <div className="flex space-x-4 mb-8">
                  <Button variant="outline" className="flex-1 flex items-center justify-center border-blue-600 text-blue-500">
                    <Facebook className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center border-blue-400 text-blue-400">
                    <Twitter className="w-5 h-5 mr-2" />
                    Tweet
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center border-blue-700 text-blue-500">
                    <LinkedinIcon className="w-5 h-5 mr-2" />
                    Post
                  </Button>
                </div>
                <div className="mt-6">
                  <Button variant="outline" className="w-full border-green-600 text-green-500">
                    View More Courses
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course CTA Banner */}
      <div className="bg-gradient-to-r from-green-900/40 to-green-700/40 border-t border-green-800/50 py-12 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">Ready to start your JavaScript journey?</h2>
              <p className="text-gray-300">Join thousands of students already enrolled</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white text-lg py-6 px-8">
              {course.isFree ? 'Enroll for Free' : 'Get Started Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;