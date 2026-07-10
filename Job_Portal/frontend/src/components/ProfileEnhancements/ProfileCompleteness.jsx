import React from 'react';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

const ProfileCompleteness = ({ user, workExperience = [], education = [], projects = [] }) => {
  const calculateCompleteness = () => {
    const checks = [
      { 
        key: 'basicInfo', 
        label: 'Basic Information', 
        completed: !!(user?.fullname && user?.email && user?.phoneNumber),
        weight: 15
      },
      { 
        key: 'profilePhoto', 
        label: 'Profile Photo', 
        completed: !!(user?.profile?.profilePhoto && user?.profile?.profilePhoto !== "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"),
        weight: 10
      },
      { 
        key: 'bio', 
        label: 'Professional Bio', 
        completed: !!(user?.profile?.bio && user?.profile?.bio.length > 20),
        weight: 15
      },
      { 
        key: 'skills', 
        label: 'Skills', 
        completed: !!(user?.profile?.skills && user?.profile?.skills.length >= 3),
        weight: 15
      },
      { 
        key: 'resume', 
        label: 'Resume/CV', 
        completed: !!(user?.profile?.resume),
        weight: 10
      },
      { 
        key: 'workExperience', 
        label: 'Work Experience', 
        completed: workExperience.length > 0,
        weight: 20
      },
      { 
        key: 'education', 
        label: 'Education', 
        completed: education.length > 0,
        weight: 10
      },
      { 
        key: 'projects', 
        label: 'Projects/Portfolio', 
        completed: projects.length > 0,
        weight: 5
      }
    ];

    const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
    const completedWeight = checks
      .filter(check => check.completed)
      .reduce((sum, check) => sum + check.weight, 0);

    const percentage = Math.round((completedWeight / totalWeight) * 100);

    return {
      percentage,
      checks,
      completedCount: checks.filter(check => check.completed).length,
      totalCount: checks.length
    };
  };

  const { percentage, checks, completedCount, totalCount } = calculateCompleteness();

  const getCompletionLevel = (percentage) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
    if (percentage >= 70) return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (percentage >= 50) return { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { label: 'Needs Work', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const level = getCompletionLevel(percentage);

  const getRecommendations = () => {
    const incomplete = checks.filter(check => !check.completed);
    return incomplete.slice(0, 3); // Show top 3 recommendations
  };

  const recommendations = getRecommendations();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Profile Completeness</h3>
        <Badge className={level.textColor + " bg-opacity-10"}>
          {level.label}
        </Badge>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {completedCount} of {totalCount} sections completed
          </span>
          <span className="text-sm font-bold text-gray-900">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {checks.map((check) => (
          <div key={check.key} className="flex items-center gap-3">
            {check.completed ? (
              <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
            ) : (
              <Circle size={16} className="text-gray-300 flex-shrink-0" />
            )}
            <span className={`text-sm ${check.completed ? 'text-gray-700' : 'text-gray-500'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-900">
              Improve Your Profile
            </h4>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div key={rec.key} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span className="text-sm text-blue-800">
                  Add {rec.label.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 mt-3">
            Complete these sections to make your profile more attractive to employers.
          </p>
        </div>
      )}

      {percentage >= 90 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-green-900">
              Outstanding Profile! 
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Your profile is comprehensive and likely to attract employer attention.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileCompleteness;