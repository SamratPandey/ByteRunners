import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authApi from '../utils/authApi';
import Nav from './Nav';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Building, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Briefcase,
  ArrowLeft
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserApplications();
  }, []);

  const fetchUserApplications = async () => {
    try {
      setLoading(true);
      const response = await authApi.get('/api/jobs/user/applications');
      
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      toast.error('Failed to fetch your applications');
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusMessage = (status) => {
    switch(status) {
      case 'pending': return 'Your application is being reviewed';
      case 'reviewed': return 'Your application has been reviewed';
      case 'accepted': return 'Congratulations! Your application was accepted';
      case 'rejected': return 'Unfortunately, your application was not successful this time';
      default: return 'Application status unknown';
    }
  };

  const ApplicationCard = ({ application }) => (
    <Card className="bg-black/40 backdrop-blur-lg border border-green-900/50 hover:border-green-600/50 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-white text-xl mb-2">{application.jobId?.title}</CardTitle>
            <div className="flex items-center text-gray-400 mb-2">
              <Building className="w-4 h-4 mr-2 text-green-500" />
              <span className="font-medium">{application.jobId?.company}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <MapPin className="w-4 h-4 mr-2 text-green-500" />
              <span>{application.jobId?.location}</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(application.status)} border flex items-center gap-1`}>
            {getStatusIcon(application.status)}
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center text-gray-400">
            <Calendar className="w-4 h-4 mr-2 text-green-500" />
            <span>Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
          </div>

          <div className="bg-black/30 p-4 rounded-lg border border-green-900/20">
            <p className="text-gray-300 text-sm">
              {getStatusMessage(application.status)}
            </p>
          </div>

          {application.coverLetter && (
            <div>
              <h4 className="text-white font-medium mb-2">Your Cover Letter:</h4>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-gray-300 text-sm whitespace-pre-line line-clamp-3">
                  {application.coverLetter}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-600/30 text-green-400 hover:bg-green-600/10"
              onClick={() => navigate(`/job/${application.jobId._id}`)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View Job
            </Button>
            
            {application.status === 'accepted' && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                🎉 Accepted!
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Nav />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading your applications...</p>
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
      </div>

      <Nav />
      
      <main className="pt-20 pb-12 px-6 relative z-10">
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
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Briefcase className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">My Job Applications</h1>
                  <p className="text-gray-400">Track the status of your job applications</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-black/30 p-4 rounded-lg border border-green-900/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{applications.length}</div>
                    <div className="text-gray-400 text-sm">Total Applications</div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg border border-yellow-900/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {applications.filter(app => app.status === 'pending').length}
                    </div>
                    <div className="text-gray-400 text-sm">Pending</div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg border border-green-900/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {applications.filter(app => app.status === 'accepted').length}
                    </div>
                    <div className="text-gray-400 text-sm">Accepted</div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg border border-red-900/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {applications.filter(app => app.status === 'rejected').length}
                    </div>
                    <div className="text-gray-400 text-sm">Rejected</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-lg border border-green-900/50">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">No Applications Yet</h3>
                <p className="text-gray-400 mb-6">
                  You haven't applied for any jobs yet. Start exploring opportunities!
                </p>
                <Button 
                  onClick={() => navigate('/job')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {applications.map((application) => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyApplications;
