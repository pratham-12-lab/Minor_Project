import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Eye, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import recruiterService from '../../services/recruiterService';

const RecruiterDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    fetchDashboard();
  }, [timeframe]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await recruiterService.getDashboard(timeframe);
      setDashboard(response.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your hiring pipeline efficiently</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              
              <Link
                to="/recruiter/jobs/create"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Job</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.overview?.totalJobs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.overview?.totalApplications || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.overview?.totalInterviews || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.overview?.profileViews || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Statistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Application Status Overview</h3>
              <div className="space-y-3">
                {Object.entries(dashboard?.applicationStats || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                      {status === 'accepted' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                      {status === 'interview-scheduled' && <Calendar className="w-4 h-4 text-blue-500" />}
                      <span className="capitalize text-gray-700">{status.replace('-', ' ')}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Performance */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Job Performance</h3>
                <Link 
                  to="/recruiter/jobs"
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-4">
                {dashboard?.jobPerformance?.slice(0, 5).map((job) => (
                  <div key={job._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {job.jobDetails?.[0]?.title || 'Untitled Job'}
                      </h4>
                      <span className="text-sm text-gray-600">
                        {job.totalApplications} applications
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Pending</p>
                        <p className="font-semibold">{job.pendingApplications}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Accepted</p>
                        <p className="font-semibold text-green-600">{job.acceptedApplications}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Success Rate</p>
                        <p className="font-semibold">
                          {job.totalApplications > 0 
                            ? Math.round((job.acceptedApplications / job.totalApplications) * 100)
                            : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            {/* Recent Applications */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Applications</h3>
                <Link 
                  to="/recruiter/applications"
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-3">
                {dashboard?.recentActivity?.applications?.map((application) => (
                  <div key={application._id} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {application.applicant?.profile?.profilePhoto ? (
                        <img
                          src={application.applicant.profile.profilePhoto}
                          alt={application.applicant.fullname}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {application.applicant?.fullname}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        Applied for {application.job?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upcoming Interviews</h3>
                <Link 
                  to="/recruiter/interviews"
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              <div className="space-y-3">
                {dashboard?.recentActivity?.interviews?.map((interview) => (
                  <div key={interview._id} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {interview.candidate?.fullname}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {interview.job?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(interview.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/recruiter/candidates/search"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Search Candidates</span>
                </Link>
                
                <Link
                  to="/recruiter/applications?status=pending"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Review Applications</span>
                </Link>
                
                <Link
                  to="/recruiter/interviews/upcoming"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Manage Interviews</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;