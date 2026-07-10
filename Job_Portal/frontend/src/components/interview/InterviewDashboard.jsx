import React, { useState, useEffect } from 'react';
// Import all required Lucide React icons
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ArrowLeft
} from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import interviewService from '../../services/interviewService';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const InterviewDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  
  // Get user role from Redux store
  const user = useSelector((state) => state.auth?.user);
  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

  useEffect(() => {
    fetchInterviews();
  }, [filter]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'upcoming') {
        params.upcoming = true;
      } else if (filter !== 'all') {
        params.status = filter;
      }
      
      // Use different API endpoint based on user role
      const response = isRecruiter 
        ? await interviewService.getRecruiterInterviews(params)
        : await interviewService.getCandidateInterviews(params);
      
      setInterviews(response.interviews || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
      toast.error('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'rescheduled':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-all duration-200 hover:translate-x-[-4px] mr-6"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-semibold">Back</span>
            </button>
            <div className="h-10 w-px bg-gray-200 mr-6"></div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {isRecruiter ? 'Interview Management' : 'My Interviews'}
              </h1>
              <p className="text-xl text-gray-600 mt-2 font-medium">
                {isRecruiter 
                  ? 'Manage your scheduled interviews with candidates' 
                  : 'View your upcoming and past interviews'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Filter:
            </span>
            <div className="flex flex-wrap gap-3">
              {['all', 'upcoming', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-3 text-sm font-semibold rounded-full transition-all duration-200 transform hover:scale-105 ${
                    filter === status
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interviews List */}
        <div className="grid gap-6">
          {interviews.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm p-12 rounded-2xl shadow-xl border border-white/20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No interviews found</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                {filter === 'all' 
                  ? "You haven't scheduled any interviews yet. Start by reviewing applications!"
                  : `No interviews found for "${filter}" filter. Try adjusting your filter.`
                }
              </p>
            </div>
          ) : (
            interviews.map((interview) => {
              const { date, time } = formatDate(interview.scheduledDate);
              
              return (
                <div key={interview._id} className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white">
                          {getTypeIcon(interview.type)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {interview.title || `${interview.type} Interview`}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(interview.status)}
                            <span className={`text-sm font-semibold px-4 py-2 rounded-full ${
                              interview.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              interview.status === 'completed' ? 'bg-green-100 text-green-800' :
                              interview.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              interview.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                          <h4 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Participant Details
                          </h4>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-700">
                              <strong className="text-indigo-800">
                                {isRecruiter ? 'Candidate:' : 'Recruiter:'}
                              </strong> {
                                isRecruiter 
                                  ? interview.candidate?.fullname 
                                  : interview.recruiter?.fullname
                              }
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong className="text-indigo-800">Position:</strong> {interview.job?.title}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong className="text-indigo-800">Company:</strong> {interview.company?.name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                          <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Schedule Details
                          </h4>
                          <div className="space-y-3">
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-purple-600" />
                              <strong className="text-purple-800">Date & Time:</strong>
                              <span className="bg-white px-3 py-1 rounded-full text-purple-700 font-medium">
                                {date} at {time}
                              </span>
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong className="text-purple-800">Duration:</strong> {interview.duration} minutes
                            </p>
                            {interview.meetingLink && (
                              <a
                                href={interview.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium hover:underline"
                              >
                                <Video className="w-4 h-4" />
                                Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {interview.description && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-gray-600" />
                            Interview Description
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {interview.description}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-3 ml-6">
                      {isRecruiter ? (
                        // Recruiter actions
                        interview.status === 'scheduled' || interview.status === 'confirmed' ? (
                          <>
                            <button
                              onClick={() => navigate(`/recruiter/interviews/${interview._id}/feedback`)}
                              className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              Add Feedback
                            </button>
                            <button
                              onClick={() => {/* Implement reschedule */}}
                              className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => {/* Implement cancel */}}
                              className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              Cancel
                            </button>
                          </>
                        ) : interview.status === 'completed' ? (
                          <div className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl text-center border border-green-200">
                            ✅ Completed
                          </div>
                        ) : interview.status === 'cancelled' ? (
                          <div className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 rounded-xl text-center border border-red-200">
                            ❌ Cancelled
                          </div>
                        ) : null
                      ) : (
                        // Candidate actions
                        interview.status === 'scheduled' && !interview.candidateConfirmed ? (
                          <button
                            onClick={async () => {
                              try {
                                await interviewService.confirmInterview(interview._id);
                                toast.success('Interview confirmed!');
                                fetchInterviews(); // Refresh the list
                              } catch (error) {
                                toast.error('Failed to confirm interview');
                              }
                            }}
                            className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                          >
                            ✅ Confirm Interview
                          </button>
                        ) : interview.status === 'confirmed' ? (
                          <div className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl text-center border border-green-200">
                            ✅ Confirmed
                          </div>
                        ) : interview.status === 'completed' ? (
                          <div className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-xl text-center border border-blue-200">
                            🎯 Completed
                          </div>
                        ) : interview.status === 'cancelled' ? (
                          <div className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 rounded-xl text-center border border-red-200">
                            ❌ Cancelled
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewDashboard;