import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Star,
  Heart,
  Eye,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import recruiterService from '../../services/recruiterService';
import profileViewService from '../../services/profileViewService';

const CandidateSearch = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    skills: [],
    location: '',
    experience: '',
    education: '',
    sortBy: 'relevance'
  });
  const [skillInput, setSkillInput] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0 });
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const searchCandidates = async (page = 1) => {
    try {
      setLoading(true);
      const searchParams = {
        ...filters,
        skills: filters.skills.join(','),
        page,
        limit: 20
      };
      
      const response = await recruiterService.searchCandidates(searchParams);
      setCandidates(response.candidates);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error searching candidates:', error);
      toast.error('Failed to search candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchCandidates();
  }, [filters]);

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!filters.skills.includes(skillInput.trim())) {
        setFilters(prev => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()]
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const trackProfileView = async (candidateId) => {
    try {
      await profileViewService.trackView(candidateId, {
        viewType: 'profile',
        context: {
          source: 'candidate-search'
        }
      });
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  };

  const saveCandidate = async (candidateId) => {
    try {
      await recruiterService.saveCandidate(candidateId);
      toast.success('Candidate saved successfully!');
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error('Failed to save candidate');
    }
  };

  const CandidateCard = ({ candidate }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {candidate.profile?.profilePhoto ? (
              <img
                src={candidate.profile.profilePhoto}
                alt={candidate.fullname}
                className="w-16 h-16 object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{candidate.fullname}</h3>
              {candidate.matchScore && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  candidate.matchScore >= 80 ? 'bg-green-100 text-green-800' :
                  candidate.matchScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {candidate.matchScore}% match
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{candidate.email}</span>
              </div>
              {candidate.phoneNumber && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{candidate.phoneNumber}</span>
                </div>
              )}
            </div>

            {/* Professional Summary */}
            {candidate.profileEnhancements?.professionalSummary?.summary && (
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {candidate.profileEnhancements.professionalSummary.summary}
              </p>
            )}

            {/* Skills */}
            {candidate.profile?.skills && candidate.profile.skills.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {candidate.profile.skills.slice(0, 6).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.profile.skills.length > 6 && (
                    <span className="text-xs text-gray-500">
                      +{candidate.profile.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Experience */}
            {candidate.profileEnhancements?.workExperience?.[0] && (
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4" />
                  <span>
                    {candidate.profileEnhancements.workExperience[0].title} at{' '}
                    {candidate.profileEnhancements.workExperience[0].company}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              trackProfileView(candidate._id);
              setSelectedCandidate(candidate);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="View Profile"
          >
            <Eye className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => saveCandidate(candidate._id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Save Candidate"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Find Candidates</h1>
          <p className="text-gray-600 mt-1">Search and discover talented professionals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={addSkill}
                placeholder="Type skill and press Enter"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {filters.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State, Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education
              </label>
              <input
                type="text"
                value={filters.education}
                onChange={(e) => setFilters(prev => ({ ...prev, education: e.target.value }))}
                placeholder="Degree, Field of Study"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest First</option>
                <option value="experience">Most Experienced</option>
                <option value="activity">Recently Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {candidates.length > 0 ? `${pagination.totalItems} candidates found` : 'Search for candidates'}
          </h2>
          
          {pagination.totalPages > 1 && (
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No candidates found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate._id} candidate={candidate} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-8">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => searchCandidates(pagination.currentPage - 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => searchCandidates(pagination.currentPage + 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Candidate Profile</h2>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              {/* Candidate details would go here */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedCandidate.profile?.profilePhoto ? (
                      <img
                        src={selectedCandidate.profile.profilePhoto}
                        alt={selectedCandidate.fullname}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCandidate.fullname}</h3>
                    <p className="text-gray-600">{selectedCandidate.email}</p>
                    {selectedCandidate.matchScore && (
                      <span className={`inline-block px-2 py-1 text-sm rounded-full mt-2 ${
                        selectedCandidate.matchScore >= 80 ? 'bg-green-100 text-green-800' :
                        selectedCandidate.matchScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedCandidate.matchScore}% match
                      </span>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                {selectedCandidate.profileEnhancements?.professionalSummary?.summary && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Professional Summary</h4>
                    <p className="text-gray-700">{selectedCandidate.profileEnhancements.professionalSummary.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedCandidate.profile?.skills && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {selectedCandidate.profileEnhancements?.workExperience && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                    <div className="space-y-3">
                      {selectedCandidate.profileEnhancements.workExperience.slice(0, 3).map((exp, index) => (
                        <div key={index} className="border-l-2 border-blue-500 pl-4">
                          <h5 className="font-medium">{exp.title}</h5>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">
                            {exp.startDate} - {exp.currentJob ? 'Present' : exp.endDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-4 pt-4 border-t">
                  <button
                    onClick={() => saveCandidate(selectedCandidate._id)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Candidate
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to contact or message
                      window.location.href = `mailto:${selectedCandidate.email}`;
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateSearch;