import { useState, useEffect } from 'react';
import adminApi from '../../utils/adminApi';  
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobCardSkeleton } from '@/components/ui/skeleton';
import { Briefcase, Search, Plus, Eye, Edit, Trash2, X } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        company: '',
        location: '',
        salary: ''
    });    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                const response = await adminApi.get('/api/jobs');
                // Handle different response structures
                if (response.data && response.data.jobs) {
                    setJobs(response.data.jobs);
                } else if (Array.isArray(response.data)) {
                    setJobs(response.data);
                } else {
                    setJobs([]);
                    toast.error("Unexpected data format received");
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Error fetching jobs';
                toast.error(errorMessage);
                setJobs([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // Reset form data
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            company: '',
            location: '',
            salary: ''
        });
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };    // Create job
    const handleCreateJob = async () => {
        // Validate form data
        if (!formData.title.trim() || !formData.description.trim() || !formData.company.trim() || 
            !formData.location.trim() || !formData.salary) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const response = await adminApi.post('/api/jobs', formData);
            if (response.data && response.data.job) {
                setJobs(prev => [...prev, response.data.job]);
                toast.success('Job created successfully!');
                setIsAddModalOpen(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error creating job:', error);
            const errorMessage = error.response?.data?.message || 'Error creating job';
            toast.error(errorMessage);
        }
    };

    // View job
    const handleViewJob = (job) => {
        setSelectedJob(job);
        setIsViewModalOpen(true);
    };

    // Edit job
    const handleEditJob = (job) => {
        setSelectedJob(job);
        setFormData({
            title: job.title || '',
            description: job.description || '',
            company: job.company || '',
            location: job.location || '',
            salary: job.salary?.toString() || ''
        });
        setIsEditModalOpen(true);
    };    // Update job
    const handleUpdateJob = async () => {
        // Validate form data
        if (!formData.title.trim() || !formData.description.trim() || !formData.company.trim() || 
            !formData.location.trim() || !formData.salary) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const response = await adminApi.put(`/api/jobs/${selectedJob._id}`, formData);
            if (response.data && response.data.job) {
                setJobs(prev => prev.map(job => 
                    job._id === selectedJob._id ? response.data.job : job
                ));
                toast.success('Job updated successfully!');
                setIsEditModalOpen(false);
                resetForm();
                setSelectedJob(null);
            }
        } catch (error) {
            console.error('Error updating job:', error);
            const errorMessage = error.response?.data?.message || 'Error updating job';
            toast.error(errorMessage);
        }
    };

    // Delete job
    const handleDeleteJob = (job) => {
        setSelectedJob(job);
        setIsDeleteModalOpen(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        try {
            await adminApi.delete(`/api/jobs/${selectedJob._id}`);
            setJobs(prev => prev.filter(job => job._id !== selectedJob._id));
            toast.success('Job deleted successfully!');
            setIsDeleteModalOpen(false);
            setSelectedJob(null);
        } catch (error) {
            console.error('Error deleting job:', error);
            const errorMessage = error.response?.data?.message || 'Error deleting job';
            toast.error(errorMessage);
        }
    };

    // Filter jobs based on search query
    const filteredJobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );    return (
        <div className="container mx-auto px-4 py-8 bg-black text-white min-h-screen">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-green-400 flex items-center">
                    <Briefcase className="mr-3" size={32} />
                    Job Management
                </h1>
                <p className="mt-2 text-gray-400">Manage job postings and opportunities</p>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div className="flex gap-4 mt-4 md:mt-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search jobs..."
                            className="pl-10 w-full md:w-64 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button 
                        className="flex items-center"
                        variant="success"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={18} className="mr-2" /> Add Job
                    </Button>
                </div>
            </div>{isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <JobCardSkeleton key={index} />
                    ))}
                </div>            ) : filteredJobs.length === 0 ? (
                <div className="text-center py-16 bg-gray-950 border border-gray-800 rounded-lg">
                    <Briefcase size={48} className="mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-white">No jobs found</h3>
                    <p className="mt-2 text-gray-400">
                        {searchQuery ? "No jobs match your search criteria" : "Start by adding a new job posting"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                        <Card key={job._id} className="overflow-hidden transition-all duration-300 hover:shadow-lg bg-gray-950 border-gray-800">
                            <CardHeader className="bg-gray-900 pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg text-white">{job.title}</CardTitle>
                                    <Badge variant="outline">{job.type || "Full-time"}</Badge>
                                </div>
                                <p className="text-sm text-gray-400">{job.location || "Remote"}</p>
                                <p className="text-sm text-gray-300 font-medium">{job.company}</p>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-sm text-gray-300 line-clamp-3">{job.description}</p>
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-green-400">
                                        Salary: ₹{job.salary?.toLocaleString() || 'Not specified'} per/year
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex items-center"
                                    onClick={() => handleViewJob(job)}
                                >
                                    <Eye size={16} className="mr-1" /> View
                                </Button>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => handleEditJob(job)}
                                    >
                                        <Edit size={16} className="text-blue-400" />
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        size="icon" 
                                        className="h-8 w-8" 
                                        onClick={() => handleDeleteJob(job)}
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>            )}
              {/* Add Job Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-2xl bg-gray-950 border-gray-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-white">Add New Job</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-gray-300">Job Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Enter job title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company" className="text-gray-300">Company</Label>
                            <Input
                                id="company"
                                name="company"
                                placeholder="Enter company name"
                                value={formData.company}
                                onChange={handleInputChange}
                                className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location" className="text-gray-300">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder="Enter job location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="salary">Salary</Label>
                            <Input
                                id="salary"
                                name="salary"
                                type="number"
                                placeholder="Enter salary"
                                value={formData.salary}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Enter job description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsAddModalOpen(false);
                            resetForm();
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateJob}>
                            Create Job
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Job Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Job Details</DialogTitle>
                    </DialogHeader>
                    {selectedJob && (
                        <div className="py-4 space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Job Title</Label>
                                <p className="mt-1 text-lg font-semibold">{selectedJob.title}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Company</Label>
                                <p className="mt-1">{selectedJob.company}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Location</Label>
                                <p className="mt-1">{selectedJob.location}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Salary</Label>
                                <p className="mt-1 text-green-600 font-medium">
                                    ${selectedJob.salary?.toLocaleString() || 'Not specified'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Description</Label>
                                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-500">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Created</Label>
                                    <p className="mt-1">{new Date(selectedJob.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Updated</Label>
                                    <p className="mt-1">{new Date(selectedJob.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={() => {
                            setIsViewModalOpen(false);
                            handleEditJob(selectedJob);
                        }}>
                            Edit Job
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Job Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Job</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-title">Job Title</Label>
                            <Input
                                id="edit-title"
                                name="title"
                                placeholder="Enter job title"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-company">Company</Label>
                            <Input
                                id="edit-company"
                                name="company"
                                placeholder="Enter company name"
                                value={formData.company}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-location">Location</Label>
                            <Input
                                id="edit-location"
                                name="location"
                                placeholder="Enter job location"
                                value={formData.location}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-salary">Salary</Label>
                            <Input
                                id="edit-salary"
                                name="salary"
                                type="number"
                                placeholder="Enter salary"
                                value={formData.salary}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                name="description"
                                placeholder="Enter job description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsEditModalOpen(false);
                            resetForm();
                            setSelectedJob(null);
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateJob}>
                            Update Job
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Job</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-600">
                            Are you sure you want to delete this job? This action cannot be undone.
                        </p>
                        {selectedJob && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium">{selectedJob.title}</p>
                                <p className="text-sm text-gray-500">{selectedJob.company}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsDeleteModalOpen(false);
                            setSelectedJob(null);
                        }}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete Job
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Toaster position="bottom-right" />
        </div>
    );
};

export default JobManagement;