import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Edit, Save, User, Target, Award, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const ProfessionalSummary = ({ summary = '', objectives = [], achievements = [], onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    summary: summary || '',
    objectives: Array.isArray(objectives) ? objectives.join('\n') : objectives || '',
    achievements: Array.isArray(achievements) ? achievements.join('\n') : achievements || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.summary.trim()) {
      toast.error('Please write a professional summary');
      return;
    }

    const updateData = {
      summary: formData.summary,
      objectives: formData.objectives.split('\n').map(s => s.trim()).filter(s => s),
      achievements: formData.achievements.split('\n').map(s => s.trim()).filter(s => s)
    };

    onUpdate(updateData);
    setIsEditing(false);
    toast.success('Professional summary updated successfully');
  };

  const handleCancel = () => {
    setFormData({
      summary: summary || '',
      objectives: Array.isArray(objectives) ? objectives.join('\n') : objectives || '',
      achievements: Array.isArray(achievements) ? achievements.join('\n') : achievements || ''
    });
    setIsEditing(false);
  };

  const getSummaryWordCount = () => {
    return formData.summary.trim().split(/\s+/).length;
  };

  const getStrengthIndicator = (wordCount) => {
    if (wordCount < 50) return { color: 'text-red-500', level: 'Weak', description: 'Add more details' };
    if (wordCount < 100) return { color: 'text-yellow-500', level: 'Good', description: 'Consider adding more' };
    if (wordCount < 200) return { color: 'text-green-500', level: 'Strong', description: 'Well detailed' };
    return { color: 'text-blue-500', level: 'Excellent', description: 'Comprehensive' };
  };

  const wordCount = getSummaryWordCount();
  const strength = getStrengthIndicator(wordCount);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User size={20} className="text-blue-600" />
          Professional Summary
        </h3>
        <Button 
          onClick={() => setIsEditing(true)} 
          size="sm" 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Edit size={16} />
          Edit
        </Button>
      </div>

      {!summary && !isEditing ? (
        <div className="text-center py-8 text-gray-500">
          <User size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="mb-2">No professional summary yet</p>
          <p className="text-sm mb-4">A compelling summary can increase profile views by 40%</p>
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit size={16} />
            Add Professional Summary
          </Button>
        </div>
      ) : !isEditing ? (
        <div className="space-y-6">
          {/* Summary Section */}
          <div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed text-base">{summary}</p>
            </div>
          </div>

          {/* Career Objectives */}
          {objectives.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target size={18} className="text-green-600" />
                Career Objectives
              </h4>
              <ul className="space-y-2">
                {objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Achievements */}
          {achievements.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award size={18} className="text-purple-600" />
                Key Achievements
              </h4>
              <ul className="space-y-2">
                {achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Professional Summary */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="summary" className="font-semibold">Professional Summary *</Label>
              <div className="flex items-center gap-2 text-sm">
                <Badge className={strength.color + " bg-opacity-10"}>
                  {strength.level}
                </Badge>
                <span className="text-gray-500">{wordCount} words</span>
              </div>
            </div>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              placeholder="Write a compelling professional summary that highlights your experience, skills, and career goals. Mention your key strengths, years of experience, and what you're passionate about..."
              rows={6}
              className="resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              {strength.description}. Recommended: 50-150 words.
            </p>
          </div>

          {/* Career Objectives */}
          <div>
            <Label htmlFor="objectives" className="font-semibold mb-2 flex items-center gap-2">
              <Target size={16} className="text-green-600" />
              Career Objectives (Optional)
            </Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => setFormData({...formData, objectives: e.target.value})}
              placeholder="List your career goals and objectives (one per line):&#10;• Transition to a senior leadership role&#10;• Develop expertise in machine learning&#10;• Lead cross-functional teams"
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">Enter each objective on a new line</p>
          </div>

          {/* Key Achievements */}
          <div>
            <Label htmlFor="achievements" className="font-semibold mb-2 flex items-center gap-2">
              <Award size={16} className="text-purple-600" />
              Key Achievements (Optional)
            </Label>
            <Textarea
              id="achievements"
              value={formData.achievements}
              onChange={(e) => setFormData({...formData, achievements: e.target.value})}
              placeholder="List your notable achievements (one per line):&#10;• Increased team productivity by 40%&#10;• Led successful product launch generating $2M revenue&#10;• Mentored 15+ junior developers"
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">Enter each achievement on a new line</p>
          </div>

          {/* Professional Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-2">Tips for a strong summary:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use action words and quantify achievements where possible</li>
                  <li>• Include your years of experience and key skills</li>
                  <li>• Mention your industry expertise and career highlights</li>
                  <li>• Keep it concise but impactful</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Save size={16} />
              Save Summary
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfessionalSummary;