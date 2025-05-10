import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Search, Filter, ChevronDown, Briefcase, MapPin, Clock, Building } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const Job = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        location: 'all'
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleJobById = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${id}`, { headers });
            return response.data;
        } catch (error) {
            toast.error("Error fetching job by ID");
        }
    }

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/jobs`, { headers });
                setJobs(response.data.jobs);
                setFilteredJobs(response.data.jobs);
            } catch (error) {
                toast.error("Error fetching jobs");
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        let results = jobs;
        
        if (searchTerm) {
            results = results.filter(job => 
                job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        if (filters.type !== 'all') {
            results = results.filter(job => job.type === filters.type);
        }
        
        if (filters.location !== 'all') {
            results = results.filter(job => job.location === filters.location);
        }
        
        setFilteredJobs(results);
    }, [searchTerm, filters, jobs]);

    const jobTypes = ['all', ...new Set(jobs.filter(job => job.type).map(job => job.type))];
    const locations = ['all', ...new Set(jobs.filter(job => job.location).map(job => job.location))];

    const getJobTypeColor = (type) => {
        switch(type?.toLowerCase()) {
            case 'full-time': return 'bg-emerald-500/20 text-emerald-400';
            case 'part-time': return 'bg-blue-500/20 text-blue-400';
            case 'contract': return 'bg-purple-500/20 text-purple-400';
            case 'internship': return 'bg-yellow-500/20 text-yellow-400';
            case 'remote': return 'bg-pink-500/20 text-pink-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
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

    const FilterSection = () => {
        return (
            <div className={`bg-black/90 backdrop-blur-lg border border-green-900/50 rounded-lg p-6 mb-8 transition-all duration-300 ${isFilterOpen ? 'max-h-screen' : 'max-h-20 overflow-hidden'}`}>
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                    <div className="flex items-center">
                        <Filter className="w-6 h-6 text-green-500 mr-2" />
                        <h3 className="text-lg font-bold text-white">Filter Jobs</h3>
                    </div>
                    <ChevronDown className={`text-green-500 transition-transform duration-300 ${isFilterOpen ? 'transform rotate-180' : ''}`} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="block text-gray-400 mb-2">Job Type</label>
                        <select 
                            className="w-full bg-black/40 border border-green-900/50 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                            value={filters.type}
                            onChange={(e) => setFilters({...filters, type: e.target.value})}
                        >
                            {jobTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type === 'all' ? 'All Job Types' : type}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-gray-400 mb-2">Location</label>
                        <select 
                            className="w-full bg-black/40 border border-green-900/50 rounded-lg p-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                            value={filters.location}
                            onChange={(e) => setFilters({...filters, location: e.target.value})}
                        >
                            {locations.map((location) => (
                                <option key={location} value={location}>
                                    {location === 'all' ? 'All Locations' : location}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    const JobCard = ({ job }) => (
        <Card className="bg-black/40 backdrop-blur-xl border-l-4 border border-green-900/50 hover:border-l-green-500 transition-all duration-300 overflow-hidden group h-full flex flex-col shadow-lg">
            <CardHeader className="bg-black/30 pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white group-hover:text-green-400 transition-colors">{job.title}</CardTitle>
                    <Badge className={`${getJobTypeColor(job.type)}`}>{job.type || "Full-time"}</Badge>
                </div>
                <div className="flex items-center text-gray-400 mt-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{job.location || "Remote"}</span>
                </div>
            </CardHeader>
            <CardContent className="pt-4 flex-grow">
                <p className="text-sm text-gray-400 line-clamp-3">{job.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                    {job.skills?.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-900/20 text-green-400 text-xs border border-green-600/20">{skill}</Badge>
                    )) || null}
                    {job.skills?.length > 4 && <Badge variant="secondary" className="bg-green-900/20 text-green-400 text-xs border border-green-600/20">+{job.skills.length - 4}</Badge>}
                </div>

                <div className="flex items-center mt-4 text-gray-400">
                    <Building className="w-4 h-4 mr-1" />
                    <span className="text-sm">{job.company || "Company Name"}</span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-green-900/30 pt-4">
                <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-xs">{new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center bg-green-600/10 border-green-600/20 text-green-500 hover:bg-green-600 hover:text-white transition-all duration-300"
                >
                    <Eye size={16} className="mr-1" /> View Details
                </Button>
            </CardFooter>
        </Card>
    );

    return(
        <div className="min-h-screen flex flex-col bg-black text-white">
            <BackgroundPattern />

            <main className="flex-1 relative z-10">
                <div className="container mx-auto px-6 py-12">
                    <div className="mb-12 text-center">
                        <Badge className="bg-green-500/10 text-green-500 text-lg px-4 py-2 mb-4">
                            Career Opportunities
                        </Badge>
                        <h1 className="text-5xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent">
                                Explore Job Listings
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Find your next career opportunity with top companies seeking talented professionals like you.
                        </p>
                    </div>

                    <div className="relative max-w-3xl mx-auto mb-12">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for job titles, skills, or companies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-lg bg-black/40 backdrop-blur-xl border border-green-900/50 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all duration-300 text-white"
                        />
                    </div>

                    <FilterSection />

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                            <p className="text-gray-400 ml-4">Loading jobs...</p>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-20">
                            <Briefcase className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
                            <p className="text-gray-400">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-gray-400 mb-6">
                                Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredJobs.map(job => (
                                    <JobCard key={job._id} job={job} />
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

            <Toaster 
                position="bottom-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: '#1f2937',
                        color: '#fff',
                        border: '1px solid #16a34a',
                    },
                }}
            />
            
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
}

export default Job;