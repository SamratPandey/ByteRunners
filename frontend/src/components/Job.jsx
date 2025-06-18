import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import authApi from '../utils/authApi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Search, Filter, ChevronDown, Briefcase, MapPin, Clock, Building, Star, Calendar, Zap } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { JobCardSkeleton } from '@/components/ui/skeleton';
import Nav from "@/components/Nav";

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
    const [featuredJobs, setFeaturedJobs] = useState([]);
    const [activeView, setActiveView] = useState('grid');
    const { isAuthenticated } = useSelector(state => state.auth);
    const navigate = useNavigate();

    const handleJobById = async (id) => {
        try {
            const response = await authApi.get(`/api/jobs/${id}`);
            return response.data;
        } catch (error) {
            toast.error("Error fetching job by ID");
        }
    }

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setIsLoading(true);
                const response = await authApi.get('/api/jobs');
                setJobs(response.data.jobs);
                setFilteredJobs(response.data.jobs);
                
                // Randomly select 3 featured jobs
                if (response.data.jobs.length > 0) {
                    const shuffled = [...response.data.jobs].sort(() => 0.5 - Math.random());
                    setFeaturedJobs(shuffled.slice(0, 3));
                }
            } catch (error) {
                toast.error("Error fetching jobs");
            } finally {
                setIsLoading(false);
            }        };
        fetchJobs();
    }, []);

    // Effect for filtering jobs based on search term and filters
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
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                            <select 
                                className="w-full bg-black/40 border border-green-900/50 rounded-lg p-3 pl-10 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none appearance-none"
                                value={filters.type}
                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                            >
                                {jobTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type === 'all' ? 'All Job Types' : type}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 pointer-events-none" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-gray-400 mb-2">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                            <select 
                                className="w-full bg-black/40 border border-green-900/50 rounded-lg p-3 pl-10 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none appearance-none"
                                value={filters.location}
                                onChange={(e) => setFilters({...filters, location: e.target.value})}
                            >
                                {locations.map((location) => (
                                    <option key={location} value={location}>
                                        {location === 'all' ? 'All Locations' : location}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };    const handleViewJobDetails = (jobId) => {
        if (!isAuthenticated) {
            toast("Please login to view job details", { icon: 'ℹ️' });
            navigate('/login', { state: { from: { pathname: `/job/${jobId}` } } });
        } else {
            navigate(`/job/${jobId}`);
        }
    };

    const FeaturedJobCard = ({ job }) => (
        <div className="group relative overflow-hidden rounded-xl bg-black/40 backdrop-blur-xl border border-green-900/50 hover:border-green-500 transition-all duration-300 shadow-lg">
            <div className="absolute top-0 right-0">
                <Badge className="bg-green-400/20 border border-green-400/30 text-green-400 m-4 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-green-400" /> Featured
                </Badge>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-2">{job.title}</h3>
                    <Badge className={`${getJobTypeColor(job.type)}`}>{job.type || "Full-time"}</Badge>
                </div>
                
                <div className="flex items-center text-gray-400 mt-2">
                    <MapPin className="w-4 h-4 mr-1 text-green-500" />
                    <span className="text-sm">{job.location || "Remote"}</span>
                </div>
                
                <div className="mt-4">
                    <p className="text-sm text-gray-300 line-clamp-3">{job.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                    {job.skills?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-900/20 text-green-400 text-xs border border-green-600/20">{skill}</Badge>
                    )) || null}
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-green-900/30">
                    <div className="flex items-center text-gray-400">
                        <Building className="w-4 h-4 mr-1 text-green-500" />
                        <span className="text-sm">{job.company || "Company Name"}</span>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-green-600/10 border-green-600/20 text-green-500 hover:bg-green-600 hover:text-white transition-all duration-300"
                        onClick={() => handleViewJobDetails(job._id)}
                    >
                        <Eye size={16} className="mr-1" /> View Details
                    </Button>
                </div>
            </div>
            {/* Decorative element */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
        </div>
    );

    const JobCard = ({ job }) => (
        <Card className="bg-black/40 backdrop-blur-xl border-l-4 border border-green-900/50 hover:border-l-green-500 transition-all duration-300 overflow-hidden group h-full flex flex-col shadow-lg">
            <CardHeader className="bg-black/30 pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white group-hover:text-green-400 transition-colors">{job.title}</CardTitle>
                    <Badge className={`${getJobTypeColor(job.type)}`}>{job.type || "Full-time"}</Badge>
                </div>
                <div className="flex items-center text-gray-400 mt-2">
                    <MapPin className="w-4 h-4 mr-1 text-green-500" />
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
                    <Building className="w-4 h-4 mr-1 text-green-500" />
                    <span className="text-sm">{job.company || "Company Name"}</span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-green-900/30 pt-4">
                <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-1 text-green-500" />
                    <span className="text-xs">{new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center bg-green-600/10 border-green-600/20 text-green-500 hover:bg-green-600 hover:text-white transition-all duration-300"
                    onClick={() => handleViewJobDetails(job._id)}
                >
                    <Eye size={16} className="mr-1" /> View Details
                </Button>
            </CardFooter>
        </Card>
    );

    const ListViewJobCard = ({ job }) => (
        <div className="bg-black/40 backdrop-blur-xl border-l-4 border border-green-900/50 hover:border-l-green-500 transition-all duration-300 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4 group">
            <div className="md:w-2/3">
                <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">{job.title}</h3>
                    <Badge className={`${getJobTypeColor(job.type)} md:hidden`}>{job.type || "Full-time"}</Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <div className="flex items-center">
                        <Building className="w-4 h-4 mr-1 text-green-500" />
                        <span>{job.company || "Company Name"}</span>
                    </div>
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-green-500" />
                        <span>{job.location || "Remote"}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-green-500" />
                        <span>{new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">{job.description}</p>
                
                <div className="flex flex-wrap gap-2">
                    {job.skills?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-900/20 text-green-400 text-xs border border-green-600/20">{skill}</Badge>
                    )) || null}
                    {job.skills?.length > 3 && <Badge variant="secondary" className="bg-green-900/20 text-green-400 text-xs border border-green-600/20">+{job.skills.length - 3}</Badge>}
                </div>
            </div>
            
            <div className="md:w-1/3 flex flex-col md:flex-row items-start md:items-center justify-between md:justify-end gap-4 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-green-900/30">
                <Badge className={`${getJobTypeColor(job.type)} hidden md:flex`}>{job.type || "Full-time"}</Badge>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center bg-green-600/10 border-green-600/20 text-green-500 hover:bg-green-600 hover:text-white transition-all duration-300 w-full md:w-auto"
                    onClick={() => handleViewJobDetails(job._id)}
                >
                    <Eye size={16} className="mr-1" /> View Details
                </Button>
            </div>
        </div>
    );    return(
        <div className="min-h-screen flex flex-col bg-black text-white">
            <BackgroundPattern />
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
                <Nav />
            </div>
            <main className="flex-1 pt-24 relative z-10">
                <div className="container mx-auto px-6 py-12">
                    <div className="mb-12 text-center">
                        <Badge className="bg-green-500/10 text-green-500 text-lg px-4 py-2 mb-4">
                            Career Opportunities
                        </Badge>
                    </div>

                    {/* Search bar */}
                    <div className="mb-8">
                        <div className="bg-black/90 backdrop-blur-lg border border-green-900/50 rounded-lg p-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search for jobs by title, description, or skills..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/40 border border-green-900/50 rounded-lg p-3 pl-12 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <FilterSection />

                    {/* Featured Jobs */}
                    {!isLoading && featuredJobs.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                <Star className="w-6 h-6 text-green-500 mr-2 fill-green-500" />
                                Featured Opportunities
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {featuredJobs.map(job => (
                                    <FeaturedJobCard key={`featured-${job._id}`} job={job} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* View toggle buttons */}
                    {!isLoading && filteredJobs.length > 0 && (
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">All Listings</h2>
                            <div className="flex border border-green-900/50 rounded-lg overflow-hidden">
                                <button 
                                    className={`px-4 py-2 flex items-center ${activeView === 'grid' ? 'bg-green-600 text-white' : 'bg-black/40 text-gray-400'}`}
                                    onClick={() => setActiveView('grid')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                    </svg>
                                </button>
                                <button 
                                    className={`px-4 py-2 flex items-center ${activeView === 'list' ? 'bg-green-600 text-white' : 'bg-black/40 text-gray-400'}`}
                                    onClick={() => setActiveView('list')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="8" y1="6" x2="21" y2="6" />
                                        <line x1="8" y1="12" x2="21" y2="12" />
                                        <line x1="8" y1="18" x2="21" y2="18" />
                                        <line x1="3" y1="6" x2="3" y2="6" />
                                        <line x1="3" y1="12" x2="3" y2="12" />
                                        <line x1="3" y1="18" x2="3" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}                    {isLoading ? (
                        <div className="space-y-6">
                            {/* Featured Jobs Skeleton */}
                            <div className="mb-8">
                                <div className="h-8 bg-gray-800 rounded animate-pulse mb-4 w-48"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(3)].map((_, index) => (
                                        <JobCardSkeleton key={`featured-${index}`} />
                                    ))}
                                </div>
                            </div>
                            
                            {/* All Jobs Skeleton */}
                            <div>
                                <div className="h-8 bg-gray-800 rounded animate-pulse mb-4 w-32"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, index) => (
                                        <JobCardSkeleton key={`job-${index}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-20 bg-black/40 backdrop-blur-xl border border-green-900/50 rounded-lg">
                            <Briefcase className="mx-auto h-16 w-16 text-green-900/40 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
                            <p className="text-gray-400 mb-8">Try adjusting your search or filters</p>
                            <Button 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilters({type: 'all', location: 'all'});
                                }}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="text-gray-400 mb-6">
                                Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                            </div>

                            {activeView === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredJobs.map(job => (
                                        <JobCard key={job._id} job={job} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {filteredJobs.map(job => (
                                        <ListViewJobCard key={`list-${job._id}`} job={job} />
                                    ))}
                                </div>
                            )}
                            
                            <div className="flex justify-center mt-12">
                                <Button className="bg-black/40 backdrop-blur-xl border border-green-900/50 hover:bg-green-900/20 text-green-500">
                                    Load More Jobs
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer className="relative z-10 border-t border-green-900/30 mt-16">
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