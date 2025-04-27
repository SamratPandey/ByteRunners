import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, ChevronDown, Clock, Book, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import Nav from './Nav';
import axios from 'axios';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    price: 'all'
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);




  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/course/all`);
        setCourses(response.data.courses);
        setFilteredCourses(response.data.courses);
        setLoading(false);
      } catch (err) {
        setError('Failed to load courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  console.log(courses);

  useEffect(() => {
    let results = courses;
    
    if (searchTerm) {
      results = results.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (filters.category !== 'all') {
      results = results.filter(course => course.category === filters.category);
    }
    
    if (filters.level !== 'all') {
      results = results.filter(course => course.level === filters.level);
    }
    if (filters.price === 'free') {
      results = results.filter(course => course.isFree);
    } else if (filters.price === 'paid') {
      results = results.filter(course => !course.isFree);
    }
    
    setFilteredCourses(results);
  }, [searchTerm, filters, courses]);
  const categories = ['all', ...new Set(courses.map(course => course.category))];


  const getTotalLessons = (course) => {
    return course.curriculum.reduce((total, section) => total + section.lessons.length, 0);
  };

  const formatPrice = (price, isFree) => {
    if (isFree) return 'Free';
    return `₹${price.toFixed(2)}`;
  };

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
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
          backgroundSize: '150px 150px'
        }}
      />
    </div>
  );
  const getLevelColor = (level) => {
    switch(level) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-400';
      case 'intermediate': return 'bg-blue-500/20 text-blue-400';
      case 'advanced': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
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
        <span className="ml-2 text-gray-400 text-sm">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const CourseCard = ({ course }) => {
  
    const handleViewCourse = () => {
      navigate(`/course-details/${course._id}`);
    };
    
    return (
      <Card className="bg-black/40 backdrop-blur-xl border-l-4 border border-green-900/50 hover:border-l-green-500 transition-all duration-300 overflow-hidden group h-full flex flex-col shadow-lg">
        <div className="relative">
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full aspect-video object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {course.isFree && (
            <Badge className="absolute top-4 left-4 bg-green-600 text-white font-medium px-3 py-1 rounded-full shadow-md">
              Free
            </Badge>
          )}
          
          <Badge className={`absolute bottom-4 left-4 px-3 py-1 rounded-full shadow-md ${getLevelColor(course.level)}`}>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </Badge>
        </div>
        
        <div className="p-5 space-y-3 flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300 line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-gray-400 text-sm line-clamp-2">
            {course.summary}
          </p>
          
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-2">
              <img 
                src={course.instructor.avatar} 
                alt={course.instructor.name} 
                className="w-8 h-8 rounded-full object-cover ring-1 ring-green-900"
              />
              <span className="text-gray-300 text-sm">{course.instructor.name}</span>
            </div>
            
            <RatingStars rating={course.averageRating} />
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-green-900/30">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-400 text-sm">
                <Book className="w-4 h-4 mr-1" />
                <span>{getTotalLessons(course)} lessons</span>
              </div>
              
              <div className="text-xl font-bold text-green-500">
                {formatPrice(course.price, course.isFree)}
              </div>
            </div>
            
            <Button 
              onClick={handleViewCourse} 
              className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all duration-300 hover:shadow-lg"
            >
              View Course
            </Button>
          </div>
        </div>
      </Card>
    );
  };
  
  const FilterSection = () => {
    return (
      <div className={`bg-black/90 backdrop-blur-lg border border-green-900/50 rounded-lg p-6 mb-8 transition-all duration-300 ${isFilterOpen ? 'max-h-screen' : 'max-h-20 overflow-hidden'}`}>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsFilterOpen(!isFilterOpen)}>
          <div className="flex items-center">
            <Filter className="w-6 h-6 text-green-500 mr-2" />
            <h3 className="text-lg font-bold text-white">Filters</h3>
          </div>
          <ChevronDown className={`text-green-500 transition-transform duration-300 ${isFilterOpen ? 'transform rotate-180' : ''}`} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <label className="block text-gray-400 mb-2">Category</label>
            <select 
              className="w-full bg-black/40 border border-green-900/50 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 mb-2">Level</label>
            <select 
              className="w-full bg-black/40 border border-green-900/50 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              value={filters.level}
              onChange={(e) => setFilters({...filters, level: e.target.value})}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-400 mb-2">Price</label>
            <select 
              className="w-full bg-black/40 border border-green-900/50 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
              value={filters.price}
              onChange={(e) => setFilters({...filters, price: e.target.value})}
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <BackgroundPattern />
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>

      <main className="flex-1 relative z-10 pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="mb-12 text-center">
            <Badge className="bg-green-500/10 text-green-500 text-lg px-4 py-2 mb-4">
              Knowledge Hub
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent">
                Explore Our Courses
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From beginner to advanced, discover courses crafted by industry experts to elevate your coding journey.
            </p>
          </div>
          <div className="relative max-w-3xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for courses, topics or technologies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg bg-black/40 backdrop-blur-xl border border-green-900/50 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all duration-300 text-white"
            />
          </div>
          <FilterSection />
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading courses...</p>
            </div>
          ) : error ? (
            <Alert className="bg-red-500/10 border-red-500 text-red-500 max-w-md mx-auto">
              {error}
            </Alert>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <BarChart className="mx-auto h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="text-gray-400 mb-6">
                Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <footer className="relative z-10 border-t border-green-900/30">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} ByteRunners. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes pulse-glow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Courses;