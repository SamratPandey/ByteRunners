import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import authApi from '../utils/authApi';
import Nav from './Nav';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Building, 
  Clock, 
  Users, 
  CheckCircle,
  FileText,
  Send,
  Star,
  Award,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    additionalNotes: ''
  });

  useEffect(() => {
    fetchJobDetails();
    if (isAuthenticated) {
      checkApplicationStatus();
    }
  }, [jobId, isAuthenticated]);

  const fetchJobDetails = async () => {
    try {
      const response = await authApi.get(`/api/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      toast.error('Failed to fetch job details');
      navigate('/job');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await authApi.get(`/api/jobs/${jobId}/check-application`);
      setApplicationStatus(response.data);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApplyForJob = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to apply for jobs');
      navigate('/login');
      return;
    }

    setIsApplying(true);
    try {
      const response = await authApi.post(`/api/jobs/${jobId}/apply`, applicationData);
      
      if (response.data.success) {
        toast.success('Application submitted successfully!');
        setShowApplicationModal(false);
        setApplicationStatus({ hasApplied: true, application: response.data.application });
        setApplicationData({ coverLetter: '', additionalNotes: '' });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit application';
      toast.error(message);
    } finally {
      setIsApplying(false);
    }
  };

  const getJobTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'full-time': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'part-time': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'contract': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'internship': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'remote': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'reviewed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Nav />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Nav />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl text-gray-400">Job not found</p>
            <Button onClick={() => navigate('/job')} className="mt-4">
              Back to Jobs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>
      
      <main className="pt-24 pb-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/job')}
              className="text-green-400 hover:text-green-300 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
            
            <div className="bg-black/40 backdrop-blur-lg border border-green-900/50 rounded-2xl p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold text-white">{job.title}</h1>
                    <Badge className={`${getJobTypeColor(job.type)} border`}>
                      {job.type || 'Full-time'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-gray-400">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 mr-2 text-green-500" />
                      <span className="text-lg">{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-500" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-green-500" />
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-4">
                  {job.salary && (
                    <div className="flex items-center text-green-400 text-xl font-bold">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {job.salary.toLocaleString()}
                      {job.salaryRange && (
                        <span className="text-gray-400 text-sm ml-2">
                          ({job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {applicationStatus?.hasApplied ? (
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(applicationStatus.application?.status)} border`}>
                        {applicationStatus.application?.status || 'Pending'}
                      </Badge>
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span>Applied</span>
                      </div>
                    </div>
                  ) : (
                    <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
                      <DialogTrigger asChild>
                        <Button 
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white px-8"
                          disabled={!isAuthenticated}
                        >
                          <Send className="w-5 h-5 mr-2" />
                          Apply Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-green-400">
                            Apply for {job.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 mt-6">
                          <div>
                            <Label htmlFor="coverLetter" className="text-gray-300">
                              Cover Letter
                            </Label>
                            <Textarea
                              id="coverLetter"
                              placeholder="Tell us why you're interested in this position..."
                              value={applicationData.coverLetter}
                              onChange={(e) => setApplicationData({
                                ...applicationData,
                                coverLetter: e.target.value
                              })}
                              className="bg-gray-800 border-gray-600 text-white mt-2"
                              rows={5}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="additionalNotes" className="text-gray-300">
                              Additional Notes (Optional)
                            </Label>
                            <Textarea
                              id="additionalNotes"
                              placeholder="Any additional information you'd like to share..."
                              value={applicationData.additionalNotes}
                              onChange={(e) => setApplicationData({
                                ...applicationData,
                                additionalNotes: e.target.value
                              })}
                              className="bg-gray-800 border-gray-600 text-white mt-2"
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowApplicationModal(false)}
                              className="border-gray-600 text-gray-300"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleApplyForJob}
                              disabled={isApplying}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isApplying ? 'Submitting...' : 'Submit Application'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Description */}
              <Card className="bg-black/40 backdrop-blur-lg border border-green-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-500" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </CardContent>
              </Card>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <Card className="bg-black/40 backdrop-blur-lg border border-green-900/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-5 h-5 mr-2 text-green-500" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <Card className="bg-black/40 backdrop-blur-lg border border-green-900/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Star className="w-5 h-5 mr-2 text-green-500" />
                      Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-1 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Info */}
              <Card className="bg-black/40 backdrop-blur-lg border border-green-900/50">
                <CardHeader>
                  <CardTitle className="text-white">Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.experience && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Experience</span>
                      <span className="text-white">{job.experience}</span>
                    </div>
                  )}
                  
                  {job.applicationDeadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deadline</span>
                      <span className="text-white">
                        {new Date(job.applicationDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Job Type</span>
                    <Badge className={`${getJobTypeColor(job.type)}`}>
                      {job.type || 'Full-time'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <Card className="bg-black/40 backdrop-blur-lg border border-green-900/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Award className="w-5 h-5 mr-2 text-green-500" />
                      Required Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="bg-green-900/20 text-green-400 border border-green-600/20"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetails;
