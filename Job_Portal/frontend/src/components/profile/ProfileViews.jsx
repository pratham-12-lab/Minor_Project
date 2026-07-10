import React, { useState, useEffect } from 'react';
import { Eye, TrendingUp, Clock, User, Building, Calendar, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import profileViewService from '../../services/profileViewService';

const ProfileViews = () => {
  const [views, setViews] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
  const [page, setPage] = useState(1);
  const [addingFakeViews, setAddingFakeViews] = useState(false);
  const [clearingViews, setClearingViews] = useState(false);

  useEffect(() => {
    fetchViews();
  }, [timeframe, page]);

  const fetchViews = async () => {
    try {
      setLoading(true);
      const response = await profileViewService.getMyViews({ timeframe, page, limit: 20 });
      setViews(response.views);
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Error fetching profile views:', error);
      toast.error('Failed to fetch profile views');
    } finally {
      setLoading(false);
    }
  };

  const addFakeViews = async () => {
    try {
      setAddingFakeViews(true);
      await profileViewService.addFakeViews(8);
      toast.success('Added 8 fake profile views!');
      fetchViews(); // Refresh the data
    } catch (error) {
      console.error('Error adding fake views:', error);
      toast.error('Failed to add fake views');
    } finally {
      setAddingFakeViews(false);
    }
  };

  const clearAllViews = async () => {
    if (!window.confirm('Are you sure you want to clear all profile views? This cannot be undone.')) {
      return;
    }
    
    try {
      setClearingViews(true);
      await profileViewService.clearAllViews();
      toast.success('All profile views cleared!');
      fetchViews(); // Refresh the data
    } catch (error) {
      console.error('Error clearing views:', error);
      toast.error('Failed to clear views');
    } finally {
      setClearingViews(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const viewed = new Date(date);
    const diffInMinutes = Math.floor((now - viewed) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const getInterestColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Eye className="w-8 h-8 mr-3 text-blue-500" />
                Profile Views
              </h1>
              <p className="text-gray-600 mt-2">See who's interested in your profile</p>
            </div>
            
            {/* Add Fake Views Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={addFakeViews}
                disabled={addingFakeViews}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{addingFakeViews ? 'Adding...' : 'Add Demo Views'}</span>
              </button>
              
              <button
                onClick={clearAllViews}
                disabled={clearingViews}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                <span>{clearingViews ? 'Clearing...' : 'Clear All Views'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalViews || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Viewers</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.uniqueViews || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageTimeSpent || 0}s</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Interest</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.highInterestViews || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Time Period:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="ml-2 border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Views List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Recent Profile Views</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : views.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No profile views yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Share your profile to get more visibility!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {views.map((view) => (
                <div key={view._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Viewer Avatar */}
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {view.viewer?.profile?.profilePhoto ? (
                          <img
                            src={view.viewer.profile.profilePhoto}
                            alt={view.viewer.fullname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {view.viewer?.fullname || 'Anonymous Recruiter'}
                          </h3>
                          {view.viewer?.role === 'recruiter' && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Recruiter
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${getInterestColor(view.interestLevel)}`}>
                            {view.interestLevel} interest
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          {view.viewer?.companyName && (
                            <div className="flex items-center space-x-1">
                              <Building className="w-4 h-4" />
                              <span>{view.viewer.companyName}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{view.timeSpent}s viewed</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatTimeAgo(view.createdAt)}</span>
                          </div>
                        </div>

                        {/* View Context */}
                        {view.context?.source && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              Source: {view.context.source.replace('-', ' ')}
                            </span>
                          </div>
                        )}

                        {/* Actions Performed */}
                        {view.actionsPerformed && view.actionsPerformed.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2">Actions taken:</p>
                            <div className="flex flex-wrap gap-2">
                              {view.actionsPerformed.map((action, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                >
                                  {action.action.replace('-', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Count */}
                    {view.viewCount > 1 && (
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{view.viewCount}x</span>
                        <p className="text-xs text-gray-500">views</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {views.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileViews;