import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, GraduationCap, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Education = ({ education = [], onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: '',
    endYear: '',
    currentlyStudying: false,
    grade: '',
    activities: '',
    description: ''
  });

  const degrees = [
    'High School Diploma',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctoral Degree (PhD)',
    'Professional Degree',
    'Certificate',
    'Diploma',
    'Other'
  ];

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
      currentlyStudying: false,
      grade: '',
      activities: '',
      description: ''
    });
    setEditingIndex(-1);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index) => {
    const edu = education[index];
    setFormData({
      institution: edu.institution || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startYear: edu.startYear || '',
      endYear: edu.endYear || '',
      currentlyStudying: edu.currentlyStudying || false,
      grade: edu.grade || '',
      activities: edu.activities || '',
      description: edu.description || ''
    });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      const newEducation = education.filter((_, i) => i !== index);
      onUpdate(newEducation);
      toast.success('Education entry deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.institution || !formData.degree) {
      toast.error('Please fill in required fields');
      return;
    }

    let newEducation;
    if (editingIndex >= 0) {
      newEducation = education.map((edu, i) => 
        i === editingIndex ? formData : edu
      );
      toast.success('Education updated successfully');
    } else {
      newEducation = [...education, formData];
      toast.success('Education added successfully');
    }

    onUpdate(newEducation);
    setIsDialogOpen(false);
    resetForm();
  };

  const getCurrentYear = () => new Date().getFullYear();
  const years = Array.from({length: 50}, (_, i) => getCurrentYear() - i);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Education</h3>
        <Button onClick={handleAdd} size="sm" className="flex items-center gap-2">
          <Plus size={16} />
          Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No education added yet</p>
          <p className="text-sm">Add your educational background to enhance your profile</p>
        </div>
      ) : (
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-6 pb-6 relative">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap size={20} className="text-green-600" />
                    <h4 className="text-lg font-semibold text-gray-900">{edu.degree}</h4>
                  </div>
                  
                  {edu.fieldOfStudy && (
                    <p className="text-gray-600 mb-2 font-medium">{edu.fieldOfStudy}</p>
                  )}
                  
                  <p className="text-gray-700 font-medium mb-2">{edu.institution}</p>
                  
                  <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm">
                    <Calendar size={14} />
                    <span>
                      {edu.startYear} - {edu.currentlyStudying ? 'Present' : edu.endYear}
                    </span>
                  </div>
                  
                  {edu.grade && (
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        Grade: {edu.grade}
                      </Badge>
                    </div>
                  )}
                  
                  {edu.activities && (
                    <p className="text-gray-600 mb-2 text-sm">
                      <span className="font-medium">Activities:</span> {edu.activities}
                    </p>
                  )}
                  
                  {edu.description && (
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {edu.description}
                    </p>
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
              {editingIndex >= 0 ? 'Edit Education' : 'Add Education'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="institution">School/University *</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
                placeholder="e.g. Stanford University"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="degree">Degree *</Label>
                <Select 
                  value={formData.degree} 
                  onValueChange={(value) => setFormData({...formData, degree: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {degrees.map((degree) => (
                      <SelectItem key={degree} value={degree}>
                        {degree}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})}
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startYear">Start Year</Label>
                <Select 
                  value={formData.startYear} 
                  onValueChange={(value) => setFormData({...formData, startYear: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="currentlyStudying"
                    checked={formData.currentlyStudying}
                    onChange={(e) => setFormData({...formData, currentlyStudying: e.target.checked})}
                  />
                  <Label htmlFor="currentlyStudying">Currently studying here</Label>
                </div>
                {!formData.currentlyStudying && (
                  <>
                    <Label htmlFor="endYear">End Year</Label>
                    <Select 
                      value={formData.endYear} 
                      onValueChange={(value) => setFormData({...formData, endYear: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="grade">Grade/GPA</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                placeholder="e.g. 3.8 GPA, First Class, 85%"
              />
            </div>

            <div>
              <Label htmlFor="activities">Activities and Societies</Label>
              <Input
                id="activities"
                value={formData.activities}
                onChange={(e) => setFormData({...formData, activities: e.target.value})}
                placeholder="e.g. Computer Science Society, Debate Team"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your achievements, relevant coursework, projects..."
                rows={3}
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
                {editingIndex >= 0 ? 'Update' : 'Add'} Education
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Education;