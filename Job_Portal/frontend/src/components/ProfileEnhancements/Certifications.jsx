import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Edit, Trash2, Award, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Certifications = ({ certifications = [], onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    issueDate: '',
    expirationDate: '',
    noExpiration: false,
    credentialId: '',
    credentialUrl: '',
    description: '',
    skills: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      organization: '',
      issueDate: '',
      expirationDate: '',
      noExpiration: false,
      credentialId: '',
      credentialUrl: '',
      description: '',
      skills: ''
    });
    setEditingIndex(-1);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index) => {
    const cert = certifications[index];
    setFormData({
      name: cert.name || '',
      organization: cert.organization || '',
      issueDate: cert.issueDate || '',
      expirationDate: cert.expirationDate || '',
      noExpiration: cert.noExpiration || false,
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      description: cert.description || '',
      skills: Array.isArray(cert.skills) ? cert.skills.join(', ') : cert.skills || ''
    });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      const newCertifications = certifications.filter((_, i) => i !== index);
      onUpdate(newCertifications);
      toast.success('Certification deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.organization) {
      toast.error('Please fill in required fields');
      return;
    }

    const certificationData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
    };

    let newCertifications;
    if (editingIndex >= 0) {
      newCertifications = certifications.map((cert, i) => 
        i === editingIndex ? certificationData : cert
      );
      toast.success('Certification updated successfully');
    } else {
      newCertifications = [...certifications, certificationData];
      toast.success('Certification added successfully');
    }

    onUpdate(newCertifications);
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

  const isExpired = (expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const getStatusBadge = (cert) => {
    if (cert.noExpiration) {
      return <Badge className="bg-green-100 text-green-800 text-xs">No Expiration</Badge>;
    }
    if (cert.expirationDate) {
      const expired = isExpired(cert.expirationDate);
      return (
        <Badge className={`text-xs ${expired ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
          {expired ? 'Expired' : 'Active'}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Certifications & Licenses</h3>
        <Button onClick={handleAdd} size="sm" className="flex items-center gap-2">
          <Plus size={16} />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Award size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No certifications added yet</p>
          <p className="text-sm">Add your professional certifications and licenses</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <Award size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900">{cert.name}</h4>
                        {getStatusBadge(cert)}
                      </div>
                      <p className="text-gray-600 font-medium">{cert.organization}</p>
                    </div>
                  </div>
                  
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Calendar size={14} />
                      <span>
                        Issued {formatDate(cert.issueDate)}
                        {cert.noExpiration 
                          ? ' • No Expiration' 
                          : cert.expirationDate 
                            ? ` • Expires ${formatDate(cert.expirationDate)}` 
                            : ''
                        }
                      </span>
                    </div>
                    
                    {cert.credentialId && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Credential ID:</span> {cert.credentialId}
                      </div>
                    )}
                    
                    {cert.description && (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {cert.description}
                      </p>
                    )}
                    
                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {cert.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-2"
                      >
                        <ExternalLink size={12} />
                        View Credential
                      </a>
                    )}
                  </div>
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
              {editingIndex >= 0 ? 'Edit Certification' : 'Add Certification'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Certification Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. AWS Solutions Architect"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="organization">Issuing Organization *</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  placeholder="e.g. Amazon Web Services"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="month"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="noExpiration"
                    checked={formData.noExpiration}
                    onChange={(e) => setFormData({...formData, noExpiration: e.target.checked})}
                  />
                  <Label htmlFor="noExpiration">This certification does not expire</Label>
                </div>
                {!formData.noExpiration && (
                  <>
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="month"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                    />
                  </>
                )}
              </div>
              
              <div>
                <Label htmlFor="credentialId">Credential ID</Label>
                <Input
                  id="credentialId"
                  value={formData.credentialId}
                  onChange={(e) => setFormData({...formData, credentialId: e.target.value})}
                  placeholder="e.g. ABC123DEF456"
                />
              </div>
              
              <div>
                <Label htmlFor="credentialUrl">Credential URL</Label>
                <Input
                  id="credentialUrl"
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({...formData, credentialUrl: e.target.value})}
                  placeholder="https://credential-url.com/verify"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what this certification covers..."
                  rows={3}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="skills">Related Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="e.g. Cloud Architecture, AWS, DevOps"
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
                {editingIndex >= 0 ? 'Update' : 'Add'} Certification
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Certifications;