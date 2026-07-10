import React, { useState, useEffect } from 'react';
import Navbar from './shared/Navbar';
import { Avatar, AvatarImage } from './ui/avatar';

import { Button } from './ui/button';
import { Contact, Mail, Pen, MapPin, Calendar, Briefcase, BarChart3 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import AppliedJobTable from './AppliedJobTable';
import UpdateProfileDialog from './UpdateProfileDialog';
import { useSelector } from 'react-redux';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';
import profileViewService from '@/services/profileViewService';

// Import ALL new profile enhancement components
import ProfileCompleteness from './ProfileEnhancements/ProfileCompleteness';
import ProfessionalSummary from './ProfileEnhancements/ProfessionalSummary';
import WorkExperience from './ProfileEnhancements/WorkExperience';
import Education from './ProfileEnhancements/Education';
import ProjectPortfolio from './ProfileEnhancements/ProjectPortfolio';
import Certifications from './ProfileEnhancements/Certifications';
import SocialLinks from './ProfileEnhancements/SocialLinks';
import ProfileAnalytics from './ProfileEnhancements/ProfileAnalytics';

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const { user } = useSelector(store => store.auth);
    const [profileViewCount, setProfileViewCount] = useState(0);
    
    // Fetch real profile views count
    useEffect(() => {
        const fetchProfileViews = async () => {
            try {
                const response = await profileViewService.getMyViews({ limit: 1 });
                setProfileViewCount(response.analytics?.totalViews || 0);
            } catch (error) {
                console.error('Error fetching profile views:', error);
                // Fallback to 0 if there's an error
                setProfileViewCount(0);
            }
        };

        if (user) {
            fetchProfileViews();
        }
    }, [user]);
    
    // State for ALL new profile sections with localStorage persistence
    const [professionalSummary, setProfessionalSummary] = useState(() => {
        const saved = localStorage.getItem(`profile_summary_${user?._id}`);
        return saved ? JSON.parse(saved) : {
            summary: "",
            objectives: [],
            achievements: []
        };
    });
    
    const [workExperience, setWorkExperience] = useState(() => {
        const saved = localStorage.getItem(`profile_work_${user?._id}`);
        return saved ? JSON.parse(saved) : [];
    });
    
    const [education, setEducation] = useState(() => {
        const saved = localStorage.getItem(`profile_education_${user?._id}`);
        return saved ? JSON.parse(saved) : [];
    });
    
    const [projects, setProjects] = useState(() => {
        const saved = localStorage.getItem(`profile_projects_${user?._id}`);
        return saved ? JSON.parse(saved) : [];
    });
    
    const [certifications, setCertifications] = useState(() => {
        const saved = localStorage.getItem(`profile_certifications_${user?._id}`);
        return saved ? JSON.parse(saved) : [];
    });
    
    const [socialLinks, setSocialLinks] = useState(() => {
        const saved = localStorage.getItem(`profile_social_${user?._id}`);
        return saved ? JSON.parse(saved) : [];
    });

    // Handlers for updating profile sections with localStorage persistence
    const handleProfessionalSummaryUpdate = (data) => {
        setProfessionalSummary(data);
        localStorage.setItem(`profile_summary_${user?._id}`, JSON.stringify(data));
    };

    const handleWorkExperienceUpdate = (newExperience) => {
        setWorkExperience(newExperience);
        localStorage.setItem(`profile_work_${user?._id}`, JSON.stringify(newExperience));
    };

    const handleEducationUpdate = (newEducation) => {
        setEducation(newEducation);
        localStorage.setItem(`profile_education_${user?._id}`, JSON.stringify(newEducation));
    };

    const handleProjectsUpdate = (newProjects) => {
        setProjects(newProjects);
        localStorage.setItem(`profile_projects_${user?._id}`, JSON.stringify(newProjects));
    };

    const handleCertificationsUpdate = (newCertifications) => {
        setCertifications(newCertifications);
        localStorage.setItem(`profile_certifications_${user?._id}`, JSON.stringify(newCertifications));
    };

    const handleSocialLinksUpdate = (newLinks) => {
        setSocialLinks(newLinks);
        localStorage.setItem(`profile_social_${user?._id}`, JSON.stringify(newLinks));
    };

    const calculateProfileViews = () => {
        // Return real profile views count from our system
        return profileViewCount;
    };

    const formatMemberSince = () => {
        if (user?.createdAt) {
            return new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
            });
        }
        return 'Recently';
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Briefcase },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
                {/* Profile Completeness Indicator */}
                <ProfileCompleteness 
                    user={user}
                    workExperience={workExperience}
                    education={education}
                    projects={projects}
                />

                {/* Enhanced Header Section */}
                <div className='bg-white border border-gray-200 rounded-2xl p-8'>
                    <div className='flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6'>
                        <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
                            <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                                <AvatarImage 
                                    src={user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"} 
                                    alt="profile" 
                                    className="object-cover"
                                />
                            </Avatar>
                            <div className="text-center sm:text-left">
                                <h1 className='font-bold text-2xl lg:text-3xl text-gray-900 mb-2'>
                                    {user?.fullname}
                                </h1>
                                <p className='text-gray-600 text-lg mb-3 max-w-md'>
                                    {user?.profile?.bio || 'Professional seeking new opportunities'}
                                </p>
                                
                                <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                                    <div className='flex items-center gap-2'>
                                        <Mail size={16} />
                                        <span>{user?.email}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Contact size={16} />
                                        <span>{user?.phoneNumber}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <Calendar size={16} />
                                        <span>Member since {formatMemberSince()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center lg:items-end gap-4">
                            <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
                                <Pen size={16} />
                                Edit Profile
                            </Button>
                            
                            <div className="text-center lg:text-right">
                                <a 
                                    href="/student/profile/views" 
                                    className="block hover:bg-gray-50 rounded-lg p-2 transition-colors"
                                    title="View detailed profile analytics"
                                >
                                    <div className="text-2xl font-bold text-blue-600">
                                        {calculateProfileViews()}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Profile Views
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    {/* Skills Section */}
                    <div className='mt-8 pt-8 border-t border-gray-100'>
                        <h2 className='font-bold text-lg text-gray-900 mb-4 flex items-center gap-2'>
                            <Briefcase size={20} />
                            Skills & Expertise
                        </h2>
                        <div className='flex flex-wrap gap-2'>
                            {user?.profile?.skills?.length > 0 ? 
                                user?.profile?.skills.map((skill, index) => (
                                    <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="px-3 py-1 text-sm"
                                    >
                                        {skill}
                                    </Badge>
                                )) : 
                                <span className="text-gray-500 italic">No skills added yet</span>
                            }
                        </div>
                    </div>
                    
                    {/* Resume Section */}
                    {user?.profile?.resume && (
                        <div className='mt-6 pt-6 border-t border-gray-100'>
                            <h2 className='font-bold text-lg text-gray-900 mb-3'>Resume/CV</h2>
                            <a 
                                target='_blank' 
                                rel='noopener noreferrer'
                                href={user?.profile?.resume} 
                                className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium'
                            >
                                📄 {user?.profile?.resumeOriginalName || 'View Resume'}
                            </a>
                        </div>
                    )}
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white rounded-lg border border-gray-200 p-1">
                    <div className="flex space-x-1">
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <IconComponent size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' ? (
                    <div className="space-y-6">
                        {/* Professional Summary */}
                        <ProfessionalSummary 
                            summary={professionalSummary.summary}
                            objectives={professionalSummary.objectives}
                            achievements={professionalSummary.achievements}
                            onUpdate={handleProfessionalSummaryUpdate}
                        />

                        {/* Social Links */}
                        <SocialLinks 
                            socialLinks={socialLinks}
                            onUpdate={handleSocialLinksUpdate}
                        />

                        {/* Work Experience */}
                        <WorkExperience 
                            experiences={workExperience}
                            onUpdate={handleWorkExperienceUpdate}
                        />

                        {/* Education */}
                        <Education 
                            education={education}
                            onUpdate={handleEducationUpdate}
                        />

                        {/* Projects & Portfolio */}
                        <ProjectPortfolio 
                            projects={projects}
                            onUpdate={handleProjectsUpdate}
                        />

                        {/* Certifications */}
                        <Certifications 
                            certifications={certifications}
                            onUpdate={handleCertificationsUpdate}
                        />
                        
                        {/* Applied Jobs */}
                        <div className='bg-white rounded-2xl border border-gray-200 p-6'>
                            <h2 className='font-bold text-xl text-gray-900 mb-6'>Applied Jobs</h2>
                            <AppliedJobTable />
                        </div>
                    </div>
                ) : (
                    /* Analytics Tab */
                    <ProfileAnalytics user={user} />
                )}
            </div>
            
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    );
};

export default Profile;
