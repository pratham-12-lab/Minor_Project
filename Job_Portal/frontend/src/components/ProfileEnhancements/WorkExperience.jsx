import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, MapPin, Calendar, Building } from 'lucide-react';
import { toast } from 'sonner';

const WorkExperience = ({ experiences = [], onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    currentJob: false,
    description: '',
    skills: '',
    employmentType: 'Full-time'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      currentJob: false,
      description: '',
      skills: '',
      employmentType: 'Full-time'
    });
    setEditingIndex(-1);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index) => {
    const exp = experiences[index];
    setFormData({
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      currentJob: exp.currentJob || false,
      description: exp.description || '',
      skills: Array.isArray(exp.skills) ? exp.skills.join(', ') : exp.skills || '',
      employmentType: exp.employmentType || 'Full-time'
    });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      const newExperiences = experiences.filter((_, i) => i !== index);
      onUpdate(newExperiences);
      toast.success('Experience deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company) {
      toast.error('Please fill in required fields');
      return;
    }

    const experienceData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
    };

    let newExperiences;
    if (editingIndex >= 0) {
      newExperiences = experiences.map((exp, i) => 
        i === editingIndex ? experienceData : exp
      );
      toast.success('Experience updated successfully');
    } else {
      newExperiences = [...experiences, experienceData];
      toast.success('Experience added successfully');
    }

    onUpdate(newExperiences);
    setIsDialogOpen(false);
    resetForm();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const calculateDuration = (startDate, endDate, currentJob) => {
    const start = new Date(startDate);
    const end = currentJob ? new Date() : new Date(endDate);
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    } else if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} yr${years !== 1 ? 's' : ''} ${remainingMonths} mo`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Work Experience</h3>
        <Button onClick={handleAdd} size="sm" className="flex items-center gap-2">
          <Plus size={16} />
          Add Experience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Building size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No work experience added yet</p>
          <p className="text-sm">Add your professional experience to showcase your career journey</p>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-6 pb-6 relative">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-semibold text-gray-900">{exp.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {exp.employmentType}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Building size={16} />
                    <span className="font-medium">{exp.company}</span>
                    {exp.location && (
                      <>
                        <span>•</span>
                        <MapPin size={14} />
                        <span>{exp.location}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-500 mb-3 text-sm">
                    <Calendar size={14} />
                    <span>
                      {formatDate(exp.startDate)} - {exp.currentJob ? 'Present' : formatDate(exp.endDate)}
                    </span>
                    <span>•</span>
                    <span>
                      {calculateDuration(exp.startDate, exp.endDate, exp.currentJob)}
                    </span>
                  </div>
                  
                  {exp.description && (
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  
                  {exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button 
                    onClick={() => handleEdit(index)} 
                    size="sm" 
                    variant="outline"
                    className="p-2"
                  >
                    <Edit size={14} />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(index)} 
                    size="sm" 
                    variant="outline"
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex >= 0 ? 'Edit Experience' : 'Add Work Experience'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  placeholder="e.g. Google"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              
              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select 
                  value={formData.employmentType} 
                  onValueChange={(value) => setFormData({...formData, employmentType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="currentJob"
                    checked={formData.currentJob}
                    onChange={(e) => setFormData({...formData, currentJob: e.target.checked})}
                  />
                  <Label htmlFor="currentJob">I currently work here</Label>
                </div>
                {!formData.currentJob && (
                  <>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="month"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your responsibilities and achievements..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="e.g. JavaScript, React, Node.js"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingIndex >= 0 ? 'Update' : 'Add'} Experience
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkExperience;