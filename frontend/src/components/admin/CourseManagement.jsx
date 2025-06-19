import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Users,
  Star,
  DollarSign,
  Calendar,
  Settings,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { courseApi } from '@/utils/adminCourseApi';
import CourseForm from './CourseForm';
import CurriculumEditor from './CurriculumEditor';
import CouponManagement from './CouponManagement';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  
  // Modal states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showCurriculumEditor, setShowCurriculumEditor] = useState(false);
  const [showCouponManagement, setShowCouponManagement] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        level: levelFilter !== 'all' ? levelFilter : undefined,
        sort: sortBy
      };

      const response = await courseApi.getAll(params);
      setCourses(response.data.data);
      setPagination(response.data.pagination);
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }  }, [currentPage, searchTerm, statusFilter, categoryFilter, levelFilter, sortBy]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setFormMode('create');
    setShowCourseForm(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setFormMode('edit');
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseApi.delete(courseId);
        toast.success('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  const handleEditCurriculum = (course) => {
    setSelectedCourse(course);
    setShowCurriculumEditor(true);
  };
  const handleManageCoupons = (course) => {
    setSelectedCourse(course);
    setShowCouponManagement(true);
  };
  const handleViewAnalytics = (course) => {
    // For now, we'll show an alert. In a real app, this would navigate to analytics page
    toast.success(`Analytics for ${course.title} - Feature coming soon!`);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showCourseForm) {
          handleFormCancel();
        } else if (showCurriculumEditor) {
          handleCurriculumCancel();
        } else if (showCouponManagement) {
          setShowCouponManagement(false);
          setSelectedCourse(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showCourseForm, showCurriculumEditor, showCouponManagement]);

  const handleFormSuccess = () => {
    setShowCourseForm(false);
    setSelectedCourse(null);
    fetchCourses();  };  const handleFormCancel = () => {
    setShowCourseForm(false);
    setSelectedCourse(null);
  };

  const handleCurriculumSuccess = () => {
    setShowCurriculumEditor(false);
    setSelectedCourse(null);
    fetchCourses();
  };

  const handleCurriculumCancel = () => {
    setShowCurriculumEditor(false);
    setTimeout(() => {
      setSelectedCourse(null);
    }, 100);
  };
  const getStatusBadge = (course) => {
    if (course.isPublished) {
      return <Badge variant="success">Published</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price, isFree) => {
    if (isFree) return 'Free';
    return `₹${price?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };  return (
    <div className="space-y-6 pt-20 bg-black text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-400">Course Management</h1>
          <p className="text-gray-400">Manage courses, curriculum, and pricing</p>
        </div>
        <Button onClick={handleCreateCourse} variant="success">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gray-950 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total || 0}</p>
                <p className="text-sm text-gray-400">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-950 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.published || 0}</p>
                <p className="text-sm text-gray-400">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-950 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.draft || 0}</p>
                <p className="text-sm text-gray-400">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-950 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.paid || 0}</p>
                <p className="text-sm text-gray-400">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-950 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.free || 0}</p>
                <p className="text-sm text-gray-400">Free</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>      {/* Filters */}
      <Card className="bg-gray-950 border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="web-development">Web Development</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
                <SelectItem value="mobile-development">Mobile Development</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="enrollments">Enrollments</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>      {/* Courses Table */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-12 h-8 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-gray-500">{course.instructor?.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(course)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatPrice(course.price, course.isFree)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{course.totalEnrollments || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{course.averageRating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(course.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCurriculum(course)}>
                              <BookOpen className="w-4 h-4 mr-2" />
                              Edit Curriculum
                            </DropdownMenuItem>                            <DropdownMenuItem onClick={() => handleManageCoupons(course)}>
                              <Settings className="w-4 h-4 mr-2" />
                              Manage Coupons
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewAnalytics(course)}>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCourse(course._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalCourses)} of {pagination.totalCourses} courses
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>      {/* Modals */}      {showCourseForm && (
        <div 
          className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleFormCancel();
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {formMode === 'create' ? 'Create New Course' : 'Edit Course'}
              </h2>
              <p className="text-gray-600 mt-1">
                {formMode === 'create' 
                  ? 'Fill in the details to create a new course'
                  : 'Update the course information'
                }
              </p>
            </div>
            <div className="p-6">
              <CourseForm
                key={`course-form-${selectedCourse?._id || 'new'}-${showCourseForm}`}
                course={selectedCourse}
                mode={formMode}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>      )}      {showCurriculumEditor && (
        <div 
          className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCurriculumCancel();
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Curriculum - {selectedCourse?.title}</h2>
              <p className="text-gray-600 mt-1">Manage course sections and lessons</p>
            </div>
            <div className="p-6">
              <CurriculumEditor
                course={selectedCourse}
                onSuccess={handleCurriculumSuccess}
                onCancel={handleCurriculumCancel}
              />
            </div>
          </div>
        </div>
      )}      {showCouponManagement && (
        <div 
          className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCouponManagement(false);
              setSelectedCourse(null);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Manage Coupons - {selectedCourse?.title}</h2>
              <p className="text-gray-600 mt-1">Create and manage discount coupons for this course</p>
            </div>
            <div className="p-6">
              <CouponManagement
                course={selectedCourse}
                onClose={() => {
                  setShowCouponManagement(false);
                  setSelectedCourse(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
