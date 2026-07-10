import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Edit, Trash2, ExternalLink, Linkedin, Github, Twitter, Globe, Instagram, Youtube } from 'lucide-react';
import { toast } from 'sonner';

const SocialLinks = ({ socialLinks = [], onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    username: ''
  });

  const platforms = [
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { name: 'GitHub', icon: Github, color: 'text-gray-800', bgColor: 'bg-gray-50' },
    { name: 'Twitter', icon: Twitter, color: 'text-blue-400', bgColor: 'bg-blue-50' },
    { name: 'Portfolio', icon: Globe, color: 'text-green-600', bgColor: 'bg-green-50' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { name: 'YouTube', icon: Youtube, color: 'text-red-600', bgColor: 'bg-red-50' }
  ];

  const getPlatformIcon = (platformName) => {
    const platform = platforms.find(p => p.name === platformName);
    return platform || { name: platformName, icon: Globe, color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  const resetForm = () => {
    setFormData({
      platform: '',
      url: '',
      username: ''
    });
    setEditingIndex(-1);
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (index) => {
    const link = socialLinks[index];
    setFormData({
      platform: link.platform || '',
      url: link.url || '',
      username: link.username || ''
    });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this social link?')) {
      const newLinks = socialLinks.filter((_, i) => i !== index);
      onUpdate(newLinks);
      toast.success('Social link deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.url) {
      toast.error('Please fill in required fields');
      return;
    }

    let newLinks;
    if (editingIndex >= 0) {
      newLinks = socialLinks.map((link, i) => 
        i === editingIndex ? formData : link
      );
      toast.success('Social link updated successfully');
    } else {
      newLinks = [...socialLinks, formData];
      toast.success('Social link added successfully');
    }

    onUpdate(newLinks);
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Social Media & Links</h3>
        <Button onClick={handleAdd} size="sm" className="flex items-center gap-2">
          <Plus size={16} />
          Add Link
        </Button>
      </div>

      {socialLinks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Globe size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No social links added yet</p>
          <p className="text-sm">Add your professional social media profiles and portfolio links</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialLinks.map((link, index) => {
            const platformInfo = getPlatformIcon(link.platform);
            const IconComponent = platformInfo.icon;
            
            return (
              <div key={index} className={`border border-gray-200 rounded-lg p-4 ${platformInfo.bgColor} hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-white shadow-sm ${platformInfo.color}`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{link.platform}</h4>
                      {link.username && (
                        <p className="text-sm text-gray-600">@{link.username}</p>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                      >
                        <ExternalLink size={12} />
                        Visit Profile
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
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
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIndex >= 0 ? 'Edit Social Link' : 'Add Social Link'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform *</Label>
              <select
                id="platform"
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Platform</option>
                {platforms.map((platform) => (
                  <option key={platform.name} value={platform.name}>
                    {platform.name}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            
            {formData.platform === 'Other' && (
              <div>
                <Label htmlFor="customPlatform">Custom Platform Name</Label>
                <Input
                  id="customPlatform"
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  placeholder="e.g. Behance, Dribbble"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="url">Profile URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                placeholder="https://linkedin.com/in/your-profile"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="username">Username (optional)</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="your_username"
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
                {editingIndex >= 0 ? 'Update' : 'Add'} Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialLinks;