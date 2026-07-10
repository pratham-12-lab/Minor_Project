import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Edit, ExternalLink, Linkedin, Github, Globe, Twitter, Instagram, Facebook } from 'lucide-react';
import { toast } from 'sonner';

const SocialMediaLinks = ({ socialLinks, onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    linkedin: socialLinks?.linkedin || '',
    github: socialLinks?.github || '',
    portfolio: socialLinks?.portfolio || '',
    twitter: socialLinks?.twitter || '',
    instagram: socialLinks?.instagram || '',
    facebook: socialLinks?.facebook || '',
    other: socialLinks?.other || ''
  });

  const socialPlatforms = [
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      placeholder: 'https://linkedin.com/in/yourprofile'
    },
    {
      key: 'github',
      label: 'GitHub',
      icon: Github,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
      placeholder: 'https://github.com/yourusername'
    },
    {
      key: 'portfolio',
      label: 'Portfolio/Website',
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      placeholder: 'https://yourportfolio.com'
    },
    {
      key: 'twitter',
      label: 'Twitter/X',
      icon: Twitter,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      placeholder: 'https://twitter.com/yourusername'
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 hover:bg-pink-100',
      placeholder: 'https://instagram.com/yourusername'
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      placeholder: 'https://facebook.com/yourprofile'
    }
  ];

  const handleEdit = () => {
    setFormData({
      linkedin: socialLinks?.linkedin || '',
      github: socialLinks?.github || '',
      portfolio: socialLinks?.portfolio || '',
      twitter: socialLinks?.twitter || '',
      instagram: socialLinks?.instagram || '',
      facebook: socialLinks?.facebook || '',
      other: socialLinks?.other || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate URLs
    const urlPattern = /^https?:\/\/.+/;
    const validatedData = {};
    
    Object.keys(formData).forEach(key => {
      const url = formData[key].trim();
      if (url) {
        if (!urlPattern.test(url)) {
          toast.error(`Please enter a valid URL for ${key}`);
          return;
        }
        validatedData[key] = url;
      }
    });

    onUpdate(validatedData);
    setIsDialogOpen(false);
    toast.success('Social media links updated successfully');
  };

  const hasAnyLinks = Object.values(socialLinks || {}).some(link => link);

  const getDisplayedLinks = () => {
    if (!socialLinks) return [];
    
    const links = [];
    socialPlatforms.forEach(platform => {
      if (socialLinks[platform.key]) {
        links.push({
          ...platform,
          url: socialLinks[platform.key]
        });
      }
    });
    
    if (socialLinks.other) {
      links.push({
        key: 'other',
        label: 'Other',
        icon: ExternalLink,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 hover:bg-gray-100',
        url: socialLinks.other
      });
    }
    
    return links;
  };

  const displayedLinks = getDisplayedLinks();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Social Media & Links</h3>
        <Button onClick={handleEdit} size="sm" variant="outline" className="flex items-center gap-2">
          <Edit size={16} />
          {hasAnyLinks ? 'Edit Links' : 'Add Links'}
        </Button>
      </div>

      {!hasAnyLinks ? (
        <div className="text-center py-8 text-gray-500">
          <Globe size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No social media links added yet</p>
          <p className="text-sm">Add your professional social media profiles and portfolio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedLinks.map((platform) => {
            const IconComponent = platform.icon;
            return (
              <a
                key={platform.key}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${platform.bgColor} border-gray-200 hover:border-gray-300`}
              >
                <IconComponent size={20} className={platform.color} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    {platform.label}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {platform.url.replace(/^https?:\/\//, '')}
                  </p>
                </div>
                <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
              </a>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Social Media & Professional Links</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {socialPlatforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <div key={platform.key}>
                    <Label htmlFor={platform.key} className="flex items-center gap-2">
                      <IconComponent size={16} className={platform.color} />
                      {platform.label}
                    </Label>
                    <Input
                      id={platform.key}
                      type="url"
                      value={formData[platform.key]}
                      onChange={(e) => setFormData({...formData, [platform.key]: e.target.value})}
                      placeholder={platform.placeholder}
                    />
                  </div>
                );
              })}

              <div>
                <Label htmlFor="other" className="flex items-center gap-2">
                  <ExternalLink size={16} className="text-gray-600" />
                  Other Website/Link
                </Label>
                <Input
                  id="other"
                  type="url"
                  value={formData.other}
                  onChange={(e) => setFormData({...formData, other: e.target.value})}
                  placeholder="https://your-other-link.com"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Tips for Professional Links:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure your LinkedIn profile is complete and professional</li>
                <li>• GitHub should showcase your best repositories and contributions</li>
                <li>• Portfolio website should highlight your best work and achievements</li>
                <li>• Keep social media profiles appropriate for professional viewing</li>
              </ul>
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
                Update Links
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialMediaLinks;