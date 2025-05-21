import React, { useState, useEffect } from 'react';
import adminApi from '../../utils/adminApi';
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
import { Search, Edit, Trash2, Plus, Filter, ArrowUpDown } from 'lucide-react';

const ProblemManagement = () => {
    const [problems, setProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterConfig, setFilterConfig] = useState({ difficulty: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 10;
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.get('/api/admin/problems');
        
        const responseData = response.data;
        
        // Check if the response has the expected structure
        if (responseData.success && Array.isArray(responseData.data)) {
          setProblems(responseData.data.map(problem => ({
            ...problem,
            acceptanceRate: problem.acceptanceRate || 0,
            status: problem.status || 'draft',
            difficulty: problem.difficulty || 'Easy'
          })));
        } else {
          throw new Error('Invalid data format received from server');
        }
      } catch (error) {
        setError(error.message);
        console.error('Error fetching problems:', error);
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
  };
  const handleUpdateProblem = async (id, updatedData) => {
    try {
      await adminApi.put(`/api/admin/problems/${id}`, updatedData);
      fetchProblems();
      setIsEditDialogOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };
  const handleDeleteProblem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      await adminApi.delete(`/api/admin/problems/${id}`);
      fetchProblems();
    } catch (error) {
      setError(error.message);
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


  const ProblemDialog = ({ problem, onClose, onSubmit, mode }) => {
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
        const updatedArray = [...prev[fieldName]];
        updatedArray[index] = value;
        return {
          ...prev,
          [fieldName]: updatedArray,
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
        [field]: [...prev[field], '']
      }));
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
                <div key={index} className="flex gap-2">
                  <Input
                    value={company}
                    onChange={(e) => handleArrayFieldChange('companies', index, e.target.value)}
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
            </Button>
            <Button onClick={() => onSubmit(formData)}>
              {mode === 'edit' ? 'Update Problem' : 'Create Problem'}
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
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>Problem Management ({problems.length} Problems)</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Problem
            </Button>
          </DialogTrigger>
          <ProblemDialog
            mode="add"
            onClose={() => setIsAddDialogOpen(false)}
            onSubmit={handleUpdateProblem}
          />
        </Dialog>
      </div>
    </CardHeader>
    <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
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
                <TableRow key={problem._id}>
                  <TableCell>{problem.title}</TableCell>
                  <TableCell>{problem.difficulty}</TableCell>
                  <TableCell>{problem.acceptanceRate?.toFixed(1)}%</TableCell>
                  <TableCell>{problem.status}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProblem(problem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {selectedProblem && (
                          <ProblemDialog
                            problem={selectedProblem}
                            mode="edit"
                            onClose={() => setIsEditDialogOpen(false)}
                            onSubmit={(data) => handleUpdateProblem(selectedProblem._id, data)}
                          />
                        )}
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProblem(problem._id)}
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
            </Button>
          </div>
        </div>
      </CardContent>
  </Card>
  );
};

export default ProblemManagement;

