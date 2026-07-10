import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, MapPin, FileText, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import interviewService from '../../services/interviewService';

const InterviewScheduling = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'video',
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    timeZone: 'UTC',
    meetingLink: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      instructions: ''
    },
    preparationInstructions: '',
    requiredDocuments: [],
    technicalRequirements: []
  });

  const interviewTypes = [
    { value: 'phone', label: 'Phone Interview', icon: '📞' },
    { value: 'video', label: 'Video Interview', icon: '🎥' },
    { value: 'in-person', label: 'In-Person Interview', icon: '🏢' },
    { value: 'technical', label: 'Technical Interview', icon: '💻' },
    { value: 'hr', label: 'HR Interview', icon: '👥' },
    { value: 'final', label: 'Final Interview', icon: '🎯' }
  ];

  const durations = [
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const interviewData = {
        ...formData,
        scheduledDate: scheduledDateTime.toISOString(),
      };

      await interviewService.scheduleInterview(applicationId, interviewData);
      toast.success('Interview scheduled successfully!');
      navigate('/recruiter/interviews');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center mb-2">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Schedule Interview</h1>
            </div>
            <p className="text-gray-600">Set up an interview for this candidate</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interview Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interviewTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Title and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Technical Interview - React Developer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {durations.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of the interview focus and what to expect..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  required
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Time *
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  required
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Meeting Details */}
            {(formData.type === 'video' || formData.type === 'phone') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Video className="inline w-4 h-4 mr-1" />
                  Meeting Link
                </label>
                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  placeholder="https://zoom.us/j/123456789 or phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {formData.type === 'in-person' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    placeholder="Street Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <textarea
                  name="location.instructions"
                  value={formData.location.instructions}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Additional location instructions (parking, floor, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Preparation Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Preparation Instructions
              </label>
              <textarea
                name="preparationInstructions"
                value={formData.preparationInstructions}
                onChange={handleInputChange}
                rows={4}
                placeholder="What should the candidate prepare for this interview? Any specific topics or materials to review?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Required Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Documents
                </label>
                <textarea
                  value={formData.requiredDocuments.join('\n')}
                  onChange={(e) => handleArrayChange('requiredDocuments', e.target.value)}
                  rows={4}
                  placeholder="Portfolio&#10;Updated Resume&#10;ID Proof&#10;(One item per line)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Requirements
                </label>
                <textarea
                  value={formData.technicalRequirements.join('\n')}
                  onChange={(e) => handleArrayChange('technicalRequirements', e.target.value)}
                  rows={4}
                  placeholder="Laptop with code editor&#10;Stable internet connection&#10;Webcam and microphone&#10;(One item per line)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduling;