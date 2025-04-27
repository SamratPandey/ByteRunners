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
import axios from 'axios';

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('curriculum');
  const [videoModalOpen, setVideoModalOpen] = useState(false);



  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/course/${courseId}`);
        setTimeout(() => {
          setCourse(response.data.course);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load course details');
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  


  // Rating stars component
 

  if (!course) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        {loading && <p>Loading...</p>}
        {error && <Alert variant="destructive">{error}</Alert>}
        {!loading && !error && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
            <div className="flex items-center mb-4">
              <Star size={20} className="text-yellow-500" />
              <span className="ml-2 text-gray-700">{course.rating}</span>
              <span className="ml-2 text-gray-500">({course.reviews} reviews)</span>
            </div>
            <div className="flex items-center mb-4">
              <Clock size={20} className="text-gray-500" />
              <span className="ml-2 text-gray-700">{course.duration} hours</span>
            </div>
            <div className="flex items-center mb-4">
              <Calendar size={20} className="text-gray-500" />
              <span className="ml-2 text-gray-700">Last updated: {course.lastUpdated}</span>
            </div>
            <div className="flex items-center mb-4">
              <Users size={20} className="text-gray-500" />
              <span className="ml-2 text-gray-700">{course.enrolledStudents} students enrolled</span>
            </div>
            <div className="flex items-center mb-4">
              <Award size={20} className="text-gray-500" />
              <span className="ml-2 text-gray-700">Certificate of completion</span>
            </div>
            <div className="flex items-center mb-4">
              <BookOpen size={20} className="text-gray-500" />
              <span className="ml-2 text-gray-700">Course materials included</span>
            </div>

            {/* Course Description */}
            <h2 className="text-xl font-semibold mt-6 mb-4">Course Description</h2>
            <p>{course.description}</p>
            {/* Course Curriculum */} 
            <h2 className="text-xl font-semibold mt-6 mb-4">Curriculum</h2>
            <div className="space-y-4">
              {course.curriculum.map((section, index) => (
                <div key={index} className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedSections({ ...expandedSections, [index]: !expandedSections[index] })}>
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    {expandedSections[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  {expandedSections[index] && (
                    <div className="mt-2 space-y-2">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="flex items-center">
                          <Play size={20} className="text-gray-500" />
                          <span className="ml-2 text-gray-700">{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>  
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetails;