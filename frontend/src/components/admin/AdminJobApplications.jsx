import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import adminApi from '../../utils/adminApi';
import { 
  Users, 
  FileText, 
  Calendar, 
  MapPin, 
  Building, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AdminJobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/api/jobs/admin/applications');
      
      if (response.data.success) {
        setApplications(response.data.applications);
        setFilteredApplications(response.data.applications);
      }
    } catch (error) {
      toast.error('Failed to fetch job applications');
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobId?.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await adminApi.put(`/api/jobs/admin/applications/${applicationId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        toast.success(`Application ${newStatus} successfully`);
        
        // Update the applications list
        setApplications(prev => 
          prev.map(app => 
            app._id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );

        // Update selected application if it's the same one
        if (selectedApplication?._id === applicationId) {
          setSelectedApplication(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      toast.error('Failed to update application status');
      console.error('Error updating status:', error);
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
  };  const ApplicationCard = ({ application }) => (
    <Card className="bg-gray-950 border border-gray-800 hover:border-green-400 hover:shadow-md transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-lg">{application.jobId?.title}</CardTitle>
            <div className="flex items-center text-gray-300 mt-1">
              <Building className="w-4 h-4 mr-1 text-green-400" />
              <span>{application.jobId?.company}</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(application.status)} border flex items-center gap-1`}>
            {getStatusIcon(application.status)}
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-gray-300">
            <Users className="w-4 h-4 mr-2 text-green-400" />
            <span className="font-medium">{application.userId?.name}</span>
            <span className="text-gray-400 ml-2">({application.userId?.email})</span>
          </div>
          
          <div className="flex items-center text-gray-400">
            <Calendar className="w-4 h-4 mr-2 text-green-400" />
            <span>Applied on {new Date(application.appliedAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-green-600" />
            <span>{application.jobId?.location}</span>
          </div>

          <div className="flex gap-2 mt-4">
            <Dialog open={showDetailsModal && selectedApplication?._id === application._id} 
                    onOpenChange={(open) => {
                      setShowDetailsModal(open);
                      if (!open) setSelectedApplication(null);
                    }}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-success text-success hover:bg-success/10"
                  onClick={() => setSelectedApplication(application)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-green-700">
                    Application Details
                  </DialogTitle>
                </DialogHeader>
                {selectedApplication && (
                  <div className="space-y-6 mt-6">                    {/* Application Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">Applicant Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="text-gray-400">Name:</span>
                            <span className="text-white ml-2">{selectedApplication.userId?.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Email:</span>
                            <span className="text-white ml-2">{selectedApplication.userId?.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Applied:</span>
                            <span className="text-white ml-2">
                              {new Date(selectedApplication.appliedAt).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <Badge className={`${getStatusColor(selectedApplication.status)} border ml-2`}>
                              {selectedApplication.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">Job Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="text-gray-400">Position:</span>
                            <span className="text-white ml-2">{selectedApplication.jobId?.title}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Company:</span>
                            <span className="text-white ml-2">{selectedApplication.jobId?.company}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Location:</span>
                            <span className="text-white ml-2">{selectedApplication.jobId?.location}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Cover Letter */}
                    {selectedApplication.coverLetter && (
                      <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">Cover Letter</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 whitespace-pre-line">
                            {selectedApplication.coverLetter}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Additional Notes */}
                    {selectedApplication.additionalNotes && (
                      <Card className="bg-gray-900 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">Additional Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 whitespace-pre-line">
                            {selectedApplication.additionalNotes}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      {selectedApplication.status !== 'accepted' && (
                        <Button
                          onClick={() => updateApplicationStatus(selectedApplication._id, 'accepted')}
                          variant="success"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                      )}
                      
                      {selectedApplication.status !== 'rejected' && (
                        <Button
                          onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected')}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      )}
                      
                      {selectedApplication.status !== 'reviewed' && (
                        <Button
                          onClick={() => updateApplicationStatus(selectedApplication._id, 'reviewed')}
                          variant="outline"
                          className="border-blue-600 text-blue-400"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Mark as Reviewed
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {application.status === 'pending' && (
              <>
                <Button 
                  size="sm"
                  onClick={() => updateApplicationStatus(application._id, 'accepted')}
                  variant="success"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button 
                  size="sm"
                  variant="destructive"
                  onClick={() => updateApplicationStatus(application._id, 'rejected')}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  if (loading) {
    return (
      <div className="p-6 bg-black text-white min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-400 mb-2">Job Applications</h1>
        <p className="text-gray-400">Manage and review job applications from candidates</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">        <Card className="bg-gray-950 border border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{applications.length}</div>
              <div className="text-gray-400">Total Applications</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-950 border border-yellow-500 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {applications.filter(app => app.status === 'pending').length}
              </div>
              <div className="text-gray-400">Pending</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-950 border border-green-500 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {applications.filter(app => app.status === 'accepted').length}
              </div>
              <div className="text-gray-400">Accepted</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-950 border border-red-500 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {applications.filter(app => app.status === 'rejected').length}
              </div>
              <div className="text-gray-400">Rejected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="bg-gray-950 border border-gray-800 shadow-sm">
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Applications Found</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search criteria' 
                : 'No job applications have been submitted yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard key={application._id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminJobApplications;
