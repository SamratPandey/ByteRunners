import React, { useState, useEffect } from 'react';
import adminApi from '../../utils/adminApi';  
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobCardSkeleton } from '@/components/ui/skeleton';
import { Briefcase, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const JobManagement = () => {
    const [jobs, setJobs] = useState([{}]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    console.log("Jobs:", jobs);

    useEffect(() => {
        const fetchJobs = async () => {            try {
                setIsLoading(true);
                const response = await adminApi.get('/api/jobs');
                setJobs(response.data.jobs);
            } catch (error) {
                toast.error("Error fetching jobs");
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);
    


    const handleDelete = (id) => {
        toast.success("Delete functionality to be implemented");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div className="flex gap-4 mt-4 md:mt-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search jobs..."
                            className="pl-10 w-full md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button className="flex items-center">
                        <Plus size={18} className="mr-2" /> Add Job
                    </Button>
                </div>
            </div>            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <JobCardSkeleton key={index} />
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <Briefcase size={48} className="mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
                    <p className="mt-2 text-gray-500">
                        {searchQuery ? "No jobs match your search criteria" : "Start by adding a new job posting"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        
                        <Card key={job._id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <CardHeader className="bg-gray-50 pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{job.title}</CardTitle>
                                    <Badge variant="outline">{job.type || "Full-time"}</Badge>
                                </div>
                                <p className="text-sm text-gray-500">{job.location || "Remote"}</p>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                                
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {job.skills?.slice(0, 3).map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                                    )) || null}
                                    {job.skills?.length > 3 && <Badge variant="secondary" className="text-xs">+{job.skills.length - 3}</Badge>}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t pt-4">
                                <Button variant="outline" size="sm" className="flex items-center">
                                    <Eye size={16} className="mr-1" /> View
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Edit size={16} className="text-blue-500" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8" 
                                        onClick={() => handleDelete(job._id)}
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
            <Toaster position="bottom-right" />
        </div>
    );
};

export default JobManagement;