import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchTerm, statusFilter, categoryFilter, levelFilter, sortBy]);

  const fetchCourses = async () => {
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
    }
  };

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
    // TODO: Navigate to analytics page
    // navigate(`/admin/courses/${course._id}/analytics`);
  };

  const handleFormSuccess = () => {
    setShowCourseForm(false);
    fetchCourses();
  };

  const handleCurriculumSuccess = () => {
    setShowCurriculumEditor(false);
    fetchCourses();
  };

  const getStatusBadge = (course) => {
    if (course.isPublished) {
      return <Badge className="bg-green-500 text-white">Published</Badge>;
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-gray-600">Manage courses, curriculum, and pricing</p>
        </div>
        <Button onClick={handleCreateCourse} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
                <p className="text-sm text-gray-600">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.published || 0}</p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.draft || 0}</p>
                <p className="text-sm text-gray-600">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.paid || 0}</p>
                <p className="text-sm text-gray-600">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.free || 0}</p>
                <p className="text-sm text-gray-600">Free</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
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
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
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
      </Card>

      {/* Modals */}
      <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Create New Course' : 'Edit Course'}
            </DialogTitle>
            <DialogDescription>
              {formMode === 'create' 
                ? 'Fill in the details to create a new course'
                : 'Update the course information'
              }
            </DialogDescription>
          </DialogHeader>
          <CourseForm
            course={selectedCourse}
            mode={formMode}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowCourseForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showCurriculumEditor} onOpenChange={setShowCurriculumEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Curriculum - {selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              Manage course sections and lessons
            </DialogDescription>
          </DialogHeader>
          <CurriculumEditor
            course={selectedCourse}
            onSuccess={handleCurriculumSuccess}
            onCancel={() => setShowCurriculumEditor(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showCouponManagement} onOpenChange={setShowCouponManagement}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Coupons - {selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              Create and manage discount coupons for this course
            </DialogDescription>
          </DialogHeader>
          <CouponManagement
            course={selectedCourse}
            onClose={() => setShowCouponManagement(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManagement;
