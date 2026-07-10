import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, User, Mail, Phone, MapPin, Calendar, Award, Briefcase, GraduationCap, Eye, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ApplicationReview = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchApplications();
  }, [jobId, sortBy, statusFilter]);

  const fetchApplications = async () => {
    // Don't fetch if jobId is undefined
    if (!jobId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.get(
        `${API_BASE_URL}/api/applications/applicants/${jobId}?sortBy=${sortBy}&status=${statusFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setApplications(response.data.job.applications);
      if (response.data.job.applications.length > 0 && !selectedApplication) {
        setSelectedApplication(response.data.job.applications[0]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status, rejectionReason = '') => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.put(
        `${API_BASE_URL}/api/applications/status/${applicationId}`,
        { status, message: rejectionReason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Application status updated successfully');
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    }
  };

  const SkillsMatchCard = ({ matching }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Skills Analysis</h3>
      
      <div className="space-y-4">
        {/* Overall Match Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Match</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  matching.overallScore >= 80 ? 'bg-green-500' :
                  matching.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${matching.overallScore}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{matching.overallScore}%</span>
          </div>
        </div>

        {/* Skills Match */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Skills Match</span>
            <span className="text-sm font-semibold">{matching.skillsMatch.percentage}%</span>
          </div>
          
          {/* Matching Skills */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2">Matching Skills:</p>
            <div className="flex flex-wrap gap-2">
              {matching.skillsMatch.matchingSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          {matching.skillsMatch.requiredSkills.filter(skill => 
            !matching.skillsMatch.matchingSkills.includes(skill)
          ).length > 0 && (
            <div>
              <p className="text-xs text-gray-600 mb-2">Missing Skills:</p>
              <div className="flex flex-wrap gap-2">
                {matching.skillsMatch.requiredSkills
                  .filter(skill => !matching.skillsMatch.matchingSkills.includes(skill))
                  .map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience Match */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Experience Level</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              matching.experienceMatch.level === 'Perfect Match' 
                ? 'bg-green-100 text-green-800'
                : matching.experienceMatch.level === 'Partial Match'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {matching.experienceMatch.level}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-600">Required: {matching.experienceMatch.requiredLevel}</span>
            <span className="text-xs text-gray-600">{matching.experienceMatch.yearsOfExperience} years</span>
          </div>
        </div>
      </div>
    </div>
  );

  const CandidateProfileCard = ({ applicant }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
          {applicant.profile?.profilePhoto ? (
            <img 
              src={applicant.profile.profilePhoto} 
              alt={applicant.fullname}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <User size={32} className="text-gray-600" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{applicant.fullname}</h3>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Mail size={16} />
              <span>{applicant.email}</span>
            </div>
            {applicant.phoneNumber && (
              <div className="flex items-center space-x-1">
                <Phone size={16} />
                <span>{applicant.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {applicant.profileEnhancements?.professionalSummary?.summary && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Professional Summary</h4>
          <p className="text-sm text-gray-700">
            {applicant.profileEnhancements.professionalSummary.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      <div className="mt-4">
        <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
        <div className="flex flex-wrap gap-2">
          {(applicant.profile?.skills || []).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Latest Experience */}
      {applicant.profileEnhancements?.workExperience?.[0] && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Current/Latest Position</h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-medium text-gray-900">
                  {applicant.profileEnhancements.workExperience[0].title}
                </h5>
                <p className="text-sm text-gray-600">
                  {applicant.profileEnhancements.workExperience[0].company}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {applicant.profileEnhancements.workExperience[0].startDate} - 
                  {applicant.profileEnhancements.workExperience[0].currentJob 
                    ? ' Present' 
                    : ` ${applicant.profileEnhancements.workExperience[0].endDate}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!jobId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Briefcase size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Job Selected</h2>
          <p className="text-gray-600 mb-4">Please select a job from your dashboard to review applications.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
          <p className="text-gray-600 mt-2">{applications.length} applications to review</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ml-2 border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="match">Best Match</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ml-2 border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="interview-scheduled">Interview Scheduled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Applications</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {applications.map((application) => (
                  <div
                    key={application._id}
                    onClick={() => setSelectedApplication(application)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedApplication?._id === application._id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {application.applicant.fullname}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {application.applicant.email}
                        </p>
                        {application.matching && (
                          <div className="flex items-center mt-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    application.matching.overallScore >= 80 ? 'bg-green-500' :
                                    application.matching.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${application.matching.overallScore}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">
                                {application.matching.overallScore}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Application Detail */}
          {selectedApplication && (
            <div className="lg:col-span-2 space-y-6">
              {/* Skills Matching */}
              {selectedApplication.matching && (
                <SkillsMatchCard matching={selectedApplication.matching} />
              )}

              {/* Candidate Profile */}
              <CandidateProfileCard applicant={selectedApplication.applicant} />

              {/* Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id, 'accepted')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle size={16} />
                    <span>Accept</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason (optional):');
                      updateApplicationStatus(selectedApplication._id, 'rejected', reason || '');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Navigate to interview scheduling
                      window.location.href = `/recruiter/interviews/schedule/${selectedApplication._id}`;
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Calendar size={16} />
                    <span>Schedule Interview</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationReview;