import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Eye, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  MapPin,
  Clock,
  Star,
  Download,
  MessageSquare
} from 'lucide-react';

const ProfileAnalytics = ({ user }) => {
  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    searchAppearances: 0,
    applicationViews: 0,
    recruiterViews: 0,
    lastWeekViews: 0,
    topSkillsViewed: [],
    viewsByLocation: [],
    recentActivity: []
  });

  const [timeRange, setTimeRange] = useState('7days');

  // Mock data generation - in real app, this would come from backend
  useEffect(() => {
    const generateMockData = () => {
      const mockData = {
        profileViews: Math.floor(Math.random() * 500) + 100,
        searchAppearances: Math.floor(Math.random() * 200) + 50,
        applicationViews: Math.floor(Math.random() * 50) + 10,
        recruiterViews: Math.floor(Math.random() * 30) + 5,
        lastWeekViews: Math.floor(Math.random() * 100) + 20,
        topSkillsViewed: [
          { skill: 'JavaScript', views: Math.floor(Math.random() * 50) + 10 },
          { skill: 'React', views: Math.floor(Math.random() * 40) + 8 },
          { skill: 'Node.js', views: Math.floor(Math.random() * 35) + 6 },
          { skill: 'Python', views: Math.floor(Math.random() * 30) + 5 },
          { skill: 'MongoDB', views: Math.floor(Math.random() * 25) + 4 }
        ],
        viewsByLocation: [
          { location: 'San Francisco, CA', views: Math.floor(Math.random() * 30) + 10 },
          { location: 'New York, NY', views: Math.floor(Math.random() * 25) + 8 },
          { location: 'Seattle, WA', views: Math.floor(Math.random() * 20) + 6 },
          { location: 'Austin, TX', views: Math.floor(Math.random() * 15) + 4 },
          { location: 'Remote', views: Math.floor(Math.random() * 35) + 12 }
        ],
        recentActivity: [
          {
            type: 'profile_view',
            description: 'Software Engineer at Google viewed your profile',
            timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
          },
          {
            type: 'skill_search',
            description: 'Your profile appeared in a React developer search',
            timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
          },
          {
            type: 'application_view',
            description: 'Recruiter viewed your application for Senior Frontend Role',
            timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
          },
          {
            type: 'profile_view',
            description: 'Startup founder viewed your projects section',
            timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
          }
        ]
      };
      setAnalytics(mockData);
    };

    generateMockData();
  }, [timeRange]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'profile_view': return <Eye size={16} className="text-blue-500" />;
      case 'skill_search': return <TrendingUp size={16} className="text-green-500" />;
      case 'application_view': return <Briefcase size={16} className="text-purple-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const previousWeekViews = analytics.profileViews - analytics.lastWeekViews;
  const growthPercentage = calculateGrowth(analytics.lastWeekViews, previousWeekViews);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Profile Analytics</h3>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 3 months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={20} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Profile Views</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{analytics.profileViews}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={12} className="text-green-500" />
              <span className="text-xs text-green-600">+{growthPercentage}% vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-green-500" />
              <span className="text-sm font-medium text-gray-600">Search Appearances</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{analytics.searchAppearances}</div>
            <div className="text-xs text-gray-500 mt-1">Times your profile appeared in searches</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Recruiter Views</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{analytics.recruiterViews}</div>
            <div className="text-xs text-gray-500 mt-1">Views from verified recruiters</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={20} className="text-orange-500" />
              <span className="text-sm font-medium text-gray-600">Application Views</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{analytics.applicationViews}</div>
            <div className="text-xs text-gray-500 mt-1">Times recruiters viewed your applications</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills Viewed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star size={18} className="text-yellow-500" />
              Top Skills Searched
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topSkillsViewed.map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-700">{skill.skill}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(skill.views / analytics.topSkillsViewed[0].views) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[2rem]">{skill.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Views by Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin size={18} className="text-red-500" />
              Views by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.viewsByLocation.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{location.location}</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(location.views / analytics.viewsByLocation[0].views) * 100}
                      className="w-16 h-2"
                    />
                    <span className="text-sm text-gray-600 min-w-[2rem]">{location.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-1">{activity.description}</p>
                  <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Optimization Tips */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <TrendingUp size={18} className="text-blue-600" />
            Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-sm text-blue-800">
                Add more skills to increase search visibility by up to 40%
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-sm text-blue-800">
                Complete your work experience section to attract more recruiter views
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-sm text-blue-800">
                Upload a professional profile photo to increase profile views by 25%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileAnalytics;