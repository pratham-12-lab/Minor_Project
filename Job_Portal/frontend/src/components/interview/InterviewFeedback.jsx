import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, XCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import interviewService from '../../services/interviewService';

const InterviewFeedback = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    technical: {
      rating: 0,
      comments: ''
    },
    communication: {
      rating: 0,
      comments: ''
    },
    problemSolving: {
      rating: 0,
      comments: ''
    },
    cultural: {
      rating: 0,
      comments: ''
    },
    overall: {
      rating: 0,
      comments: '',
      recommendation: '' // 'hire', 'no-hire', 'maybe'
    }
  });

  const criteria = [
    {
      key: 'technical',
      label: 'Technical Skills',
      description: 'Candidate\'s technical knowledge and problem-solving abilities'
    },
    {
      key: 'communication',
      label: 'Communication',
      description: 'Clarity of communication and articulation of ideas'
    },
    {
      key: 'problemSolving',
      label: 'Problem Solving',
      description: 'Approach to solving problems and analytical thinking'
    },
    {
      key: 'cultural',
      label: 'Cultural Fit',
      description: 'Alignment with company values and team dynamics'
    }
  ];

  const handleRatingChange = (category, rating) => {
    setFeedback(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        rating: rating
      }
    }));
  };

  const handleCommentChange = (category, comments) => {
    setFeedback(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        comments: comments
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await interviewService.submitFeedback(interviewId, feedback);
      toast.success('Feedback submitted successfully!');
      navigate('/recruiter/interviews');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, size = 20 }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              size={size}
              className={`${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
      </div>
    );
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
              <h1 className="text-2xl font-bold text-gray-900">Interview Feedback</h1>
            </div>
            <p className="text-gray-600">Provide detailed feedback for this interview</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Criteria Ratings */}
            {criteria.map((criterion) => (
              <div key={criterion.key} className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{criterion.label}</h3>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Rating:</span>
                  <StarRating
                    rating={feedback[criterion.key].rating}
                    onRatingChange={(rating) => handleRatingChange(criterion.key, rating)}
                  />
                  <span className="text-sm text-gray-600">
                    {feedback[criterion.key].rating > 0 ? `${feedback[criterion.key].rating}/5` : 'Not rated'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments
                  </label>
                  <textarea
                    value={feedback[criterion.key].comments}
                    onChange={(e) => handleCommentChange(criterion.key, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Comments about ${criterion.label.toLowerCase()}...`}
                  />
                </div>
              </div>
            ))}

            {/* Overall Assessment */}
            <div className="border-t pt-6 space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Overall Assessment</h3>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
                <StarRating
                  rating={feedback.overall.rating}
                  onRatingChange={(rating) => handleRatingChange('overall', rating)}
                  size={24}
                />
                <span className="text-sm text-gray-600">
                  {feedback.overall.rating > 0 ? `${feedback.overall.rating}/5` : 'Not rated'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Comments
                </label>
                <textarea
                  value={feedback.overall.comments}
                  onChange={(e) => handleCommentChange('overall', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Overall feedback about the candidate..."
                />
              </div>

              {/* Recommendation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Recommendation
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'hire', label: 'Hire', icon: CheckCircle, color: 'green' },
                    { value: 'maybe', label: 'Maybe', icon: MessageSquare, color: 'yellow' },
                    { value: 'no-hire', label: 'Do Not Hire', icon: XCircle, color: 'red' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`relative flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        feedback.overall.recommendation === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recommendation"
                        value={option.value}
                        checked={feedback.overall.recommendation === option.value}
                        onChange={(e) => setFeedback(prev => ({
                          ...prev,
                          overall: { ...prev.overall, recommendation: e.target.value }
                        }))}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <option.icon 
                          className={`w-8 h-8 mx-auto mb-2 ${
                            option.color === 'green' ? 'text-green-500' :
                            option.color === 'yellow' ? 'text-yellow-500' :
                            'text-red-500'
                          }`}
                        />
                        <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      </div>
                    </label>
                  ))}
                </div>
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
                disabled={loading || !feedback.overall.recommendation}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewFeedback;