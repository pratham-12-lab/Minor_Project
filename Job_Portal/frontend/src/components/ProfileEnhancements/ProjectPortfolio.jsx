import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Edit, Trash2, ExternalLink, Github, Calendar, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

const ProjectPortfolio = ({ projects = [], onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    startDate: '',
    endDate: '',
    ongoing: false,
    liveUrl: '',
    githubUrl: '',
    imageUrl: '',
    highlights: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      technologies: '',
      startDate: '',
      endDate: '',
      ongoing: false,
      liveUrl: '',
      githubUrl: '',
      imageUrl: '',
      highlights: ''
    });
    setEditingIndex(-1);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index) => {
    const project = projects[index];
    setFormData({
      title: project.title || '',
      description: project.description || '',
      technologies: Array.isArray(project.technologies) 
        ? project.technologies.join(', ') 
        : project.technologies || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      ongoing: project.ongoing || false,
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      imageUrl: project.imageUrl || '',
      highlights: Array.isArray(project.highlights) 
        ? project.highlights.join('\n') 
        : project.highlights || ''
    });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const newProjects = projects.filter((_, i) => i !== index);
      onUpdate(newProjects);
      toast.success('Project deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    const projectData = {
      ...formData,
      technologies: formData.technologies.split(',').map(s => s.trim()).filter(s => s),
      highlights: formData.highlights.split('\n').map(s => s.trim()).filter(s => s)
    };

    let newProjects;
    if (editingIndex >= 0) {
      newProjects = projects.map((project, i) => 
        i === editingIndex ? projectData : project
      );
      toast.success('Project updated successfully');
    } else {
      newProjects = [...projects, projectData];
      toast.success('Project added successfully');
    }

    onUpdate(newProjects);
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Projects & Portfolio</h3>
        <Button onClick={handleAdd} size="sm" className="flex items-center gap-2">
          <Plus size={16} />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FolderOpen size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No projects added yet</p>
          <p className="text-sm">Showcase your work and demonstrate your skills</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {project.imageUrl && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {project.title}
                  </h4>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      onClick={() => handleEdit(index)} 
                      size="sm" 
                      variant="outline"
                      className="p-1.5"
                    >
                      <Edit size={12} />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(index)} 
                      size="sm" 
                      variant="outline"
                      className="p-1.5 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="flex items-center gap-2 text-gray-500 mb-3 text-xs">
                  <Calendar size={12} />
                  <span>
                    {formatDate(project.startDate)} - {project.ongoing ? 'Ongoing' : formatDate(project.endDate)}
                  </span>
                </div>
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies.slice(0, 4).map((tech, techIndex) => (
                      <Badge key={techIndex} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
                
                {project.highlights && project.highlights.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-1">Key Highlights:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {project.highlights.slice(0, 2).map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
                    >
                      <ExternalLink size={12} />
                      Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 bg-gray-50 px-2 py-1 rounded"
                    >
                      <Github size={12} />
                      Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIndex >= 0 ? 'Edit Project' : 'Add Project'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. E-commerce Platform"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your project, what it does, and your role..."
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                <Input
                  id="technologies"
                  value={formData.technologies}
                  onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                  placeholder="e.g. React, Node.js, MongoDB"
                />
              </div>
              
              <div>
                <Label htmlFor="imageUrl">Project Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/project-image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="ongoing"
                    checked={formData.ongoing}
                    onChange={(e) => setFormData({...formData, ongoing: e.target.checked})}
                  />
                  <Label htmlFor="ongoing">Ongoing project</Label>
                </div>
                {!formData.ongoing && (
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
              
              <div>
                <Label htmlFor="liveUrl">Live Demo URL</Label>
                <Input
                  id="liveUrl"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({...formData, liveUrl: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                  placeholder="https://github.com/username/project"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="highlights">Key Highlights (one per line)</Label>
                <Textarea
                  id="highlights"
                  value={formData.highlights}
                  onChange={(e) => setFormData({...formData, highlights: e.target.value})}
                  placeholder="Increased user engagement by 40%&#10;Implemented real-time features&#10;Deployed on AWS with 99.9% uptime"
                  rows={3}
                />
              </div>
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
                {editingIndex >= 0 ? 'Update' : 'Add'} Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectPortfolio;