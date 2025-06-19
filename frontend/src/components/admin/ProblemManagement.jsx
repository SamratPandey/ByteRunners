import { useState, useEffect } from 'react';
import adminApi from '../../utils/adminApi';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TableSkeleton } from '@/components/ui/skeleton';
import { Search, Edit, Trash2, Plus, Filter, ArrowUpDown, X, RefreshCw } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const ProblemManagement = () => {
    const [problems, setProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterConfig, setFilterConfig] = useState({ difficulty: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 10;    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.get('/api/admin/problems');
        const responseData = response.data;
          // Check if the response has the expected structure
        if (responseData.success && Array.isArray(responseData.data)) {
          const processedProblems = responseData.data.map(problem => ({
            ...problem,
            acceptanceRate: problem.acceptanceRate || 0,
            status: problem.status || 'draft',
            difficulty: problem.difficulty || 'Easy'
          }));
          setProblems(processedProblems);
        } else {
          throw new Error('Invalid data format received from server');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch problems';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchProblems();
    }, []);
    
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };  const handleUpdateProblem = async (id, updatedData) => {
    // Check if ID is valid before proceeding
    if (!id || id === 'undefined' || typeof id === 'undefined') {
      toast.error('Invalid problem ID. Please refresh the page and try again.');
      return;
    }
    
    // Show confirmation for significant changes
    const confirmUpdate = window.confirm('Are you sure you want to update this problem? This will affect all users working on it.');
    if (!confirmUpdate) return;
    
    try {
      setIsSubmitting(true); 
      const response = await adminApi.put(`/api/admin/problems/${id}`, updatedData);
      
      await fetchProblems();
      setIsEditDialogOpen(false);
      setSelectedProblem(null);
      setError(null);
      toast.success('Problem updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update problem';
      setError(errorMessage);
      toast.error(`Update failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProblem = async (newData) => {
    try {
      setIsSubmitting(true);
      await adminApi.post('/api/admin/problems', newData);
      await fetchProblems();
      setIsAddDialogOpen(false);
      setError(null);
      toast.success('Problem created successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create problem';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };  const handleDeleteProblem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      await adminApi.delete(`/api/admin/problems/${id}`);
      await fetchProblems();
      toast.success('Problem deleted successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete problem';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleFilter = (value) => {
    setFilterConfig({ ...filterConfig, difficulty: value });
    setCurrentPage(1);
  };

  const sortAndFilterProblems = () => {
  let filteredProblems = [...problems];

  if (searchQuery) {
    filteredProblems = filteredProblems.filter(problem =>
      (problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      problem.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  if (filterConfig.difficulty !== 'all') {
    filteredProblems = filteredProblems.filter(problem => 
      problem.difficulty === filterConfig.difficulty
    );
  }

  if (sortConfig.key) {
    filteredProblems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filteredProblems;
};


  const ProblemDialog = ({ problem, onClose, onSubmit, mode, isSubmitting }) => {
    const [formData, setFormData] = useState(() => ({
      title: '',
      description: '',
      difficulty: 'Easy',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      timeLimit: 1000,
      memoryLimit: 256,
      examples: [{ input: '', output: '', explanation: '' }],
      testCases: [{ input: '', output: '', isHidden: true }],
      tags: [''],
      categories: [''],
      companies: [''],
      solutions: [],
      status: 'draft',
      premium: false,
      similarProblems: [],
      ...(problem || {}) 
    }));
    const handleArrayFieldChange = (field, index, key, value) => {
      setFormData((prev) => {
        const updatedArray = [...prev[field]];
        if (key === '') {
          // For simple array fields like tags, categories, companies
          updatedArray[index] = value;
        } else {
          // For complex objects like examples, testCases
          updatedArray[index] = {
            ...updatedArray[index],
            [key]: value
          };
        }
        return {
          ...prev,
          [field]: updatedArray,
        };
      });
    };
  
    const addArrayField = (field, template) => {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], template]
      }));
    };
  
    const removeArrayField = (field, index) => {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    };
  
    const addSimpleArrayField = (field) => {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], '']      }));
    };
  
    const validateForm = () => {
      const errors = [];
      if (!formData.title?.trim()) errors.push('Title is required');
      if (!formData.description?.trim()) errors.push('Description is required');
      if (!formData.difficulty) errors.push('Difficulty is required');
      
      // Validate examples
      if (!formData.examples?.length) {
        errors.push('At least one example is required');
      } else {
        const incompleteExamples = formData.examples.filter(ex => !ex.input?.trim() || !ex.output?.trim());
        if (incompleteExamples.length > 0) {
          errors.push(`${incompleteExamples.length} example(s) have missing input or output`);
        }
      }
      
      // Validate test cases
      if (!formData.testCases?.length) {
        errors.push('At least one test case is required');
      } else {
        const incompleteTestCases = formData.testCases.filter(tc => !tc.input?.trim() || !tc.output?.trim());
        if (incompleteTestCases.length > 0) {
          errors.push(`${incompleteTestCases.length} test case(s) have missing input or output`);
        }
      }
      
      // Validate limits
      if (formData.timeLimit && (formData.timeLimit < 100 || formData.timeLimit > 10000)) {
        errors.push('Time limit must be between 100ms and 10000ms');
      }
      if (formData.memoryLimit && (formData.memoryLimit < 32 || formData.memoryLimit > 1024)) {
        errors.push('Memory limit must be between 32MB and 1024MB');
      }
      
      if (errors.length > 0) {
        toast.error(errors.join(', '), { duration: 5000 });
        return false;
      }
      return true;
    };

    const handleSubmit = () => {
      if (validateForm()) {
        onSubmit(formData);
      }
    };
  
    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Problem' : 'Add New Problem'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[100px]"
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
  
          {/* Problem Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Problem Details</h3>
            <Textarea
              placeholder="Input Format"
              value={formData.inputFormat}
              onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
            />
            <Textarea
              placeholder="Output Format"
              value={formData.outputFormat}
              onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
            />
            <Textarea
              placeholder="Constraints"
              value={formData.constraints}
              onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Time Limit (ms)"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Memory Limit (MB)"
                value={formData.memoryLimit}
                onChange={(e) => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) })}
              />
            </div>
          </div>
  
          {/* Examples Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Examples</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField('examples', { input: '', output: '', explanation: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Example
              </Button>
            </div>
            {formData.examples.map((example, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayField('examples', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Input"
                  value={example.input}
                  onChange={(e) => handleArrayFieldChange('examples', index, 'input', e.target.value)}
                />
                <Textarea
                  placeholder="Output"
                  value={example.output}
                  onChange={(e) => handleArrayFieldChange('examples', index, 'output', e.target.value)}
                />
                <Textarea
                  placeholder="Explanation (optional)"
                  value={example.explanation}
                  onChange={(e) => handleArrayFieldChange('examples', index, 'explanation', e.target.value)}
                />
              </div>
            ))}
          </div>
  
          {/* Test Cases Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Test Cases</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayField('testCases', { input: '', output: '', isHidden: true })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Test Case
              </Button>
            </div>
            {formData.testCases.map((testCase, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Select
                    value={testCase.isHidden.toString()}
                    onValueChange={(value) => handleArrayFieldChange('testCases', index, 'isHidden', value === 'true')}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Hidden</SelectItem>
                      <SelectItem value="false">Visible</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayField('testCases', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Input"
                  value={testCase.input}
                  onChange={(e) => handleArrayFieldChange('testCases', index, 'input', e.target.value)}
                />
                <Textarea
                  placeholder="Output"
                  value={testCase.output}
                  onChange={(e) => handleArrayFieldChange('testCases', index, 'output', e.target.value)}
                />
              </div>
            ))}
          </div>
  
          {/* Categories, Tags, and Companies Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tags */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Tags</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addSimpleArrayField('tags')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tag}
                    onChange={(e) => handleArrayFieldChange('tags', index, '', e.target.value)}
                    placeholder="Tag"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayField('tags', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
  
            {/* Categories */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Categories</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addSimpleArrayField('categories')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.categories.map((category, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={category}
                    onChange={(e) => handleArrayFieldChange('categories', index, '', e.target.value)}
                    placeholder="Category"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayField('categories', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
  
            {/* Companies */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Companies</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addSimpleArrayField('companies')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.companies.map((company, index) => (
                <div key={index} className="flex gap-2">                  <Input
                    value={company}
                    onChange={(e) => handleArrayFieldChange('companies', index, '', e.target.value)}
                    placeholder="Company"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayField('companies', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

            </div>
          </div>
  
          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Settings</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="premium"
                checked={formData.premium}
                onChange={(e) => setFormData({ ...formData, premium: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="premium">Premium Problem</label>
            </div>
          </div>
  
          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Problem' : 'Create Problem')}
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  const paginatedProblems = () => {
    const filteredProblems = sortAndFilterProblems();
    const startIndex = (currentPage - 1) * problemsPerPage;
    return filteredProblems.slice(startIndex, startIndex + problemsPerPage);
  };

  const totalPages = Math.ceil(sortAndFilterProblems().length / problemsPerPage);
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Problem Management</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={10} />
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className="w-full bg-gray-950 border-gray-800">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status) => {
    const statusVariants = {
      'draft': 'secondary',
      'published': 'success',
      'archived': 'destructive'
    };
    
    return (
      <Badge variant={statusVariants[status] || statusVariants.draft}>
        {status || 'draft'}
      </Badge>
    );
  };

  return (
    <>
      <Card className="w-full bg-gray-950 border-gray-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Problem Management ({problems.length} Problems)</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchProblems}
                disabled={loading}
              >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Problem
              </Button>
            </DialogTrigger>          <ProblemDialog
            mode="add"
            onClose={() => setIsAddDialogOpen(false)}
            onSubmit={handleCreateProblem}
            isSubmitting={isSubmitting}
          />
        </Dialog>
        </div>
      </div>
    </CardHeader>
    <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex items-center space-x-2 w-full md:w-auto relative">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm pr-8"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterConfig.difficulty} onValueChange={handleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('title')} className="cursor-pointer">
                  <div className="flex items-center">
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('difficulty')} className="cursor-pointer">
                  <div className="flex items-center">
                    Difficulty
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('acceptanceRate')} className="cursor-pointer">
                  <div className="flex items-center">
                    Acceptance Rate
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                  <div className="flex items-center">
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProblems().map(problem => (
                <TableRow key={problem.id}>
                  <TableCell>{problem.title}</TableCell>
                  <TableCell>{problem.difficulty}</TableCell>
                  <TableCell>{problem.acceptanceRate?.toFixed(1)}%</TableCell>
                  <TableCell>{getStatusBadge(problem.status)}</TableCell>                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProblem(problem);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {selectedProblem && (                          <ProblemDialog
                            problem={selectedProblem}
                            mode="edit"
                            onClose={() => {
                              setIsEditDialogOpen(false);
                              setSelectedProblem(null);
                            }}                            onSubmit={(data) => {
                              handleUpdateProblem(selectedProblem.id, data);
                            }}
                            isSubmitting={isSubmitting}
                          />
                        )}
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProblem(problem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * problemsPerPage) + 1} to {Math.min(currentPage * problemsPerPage, sortAndFilterProblems().length)} of {sortAndFilterProblems().length} problems
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>          </div>
        </div>
      </CardContent>
      </Card>
      <Toaster position="bottom-right" />
    </>
  );
};

export default ProblemManagement;

