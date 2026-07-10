import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Bookmark } from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SAVED_JOBS_API_END_POINT, APPLICATION_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const Job = ({ job }) => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const [isSaved, setIsSaved] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [isRejected, setIsRejected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);

    useEffect(() => {
        checkIfSaved();
        checkIfApplied();
    }, [job._id, user?._id]);

    const checkIfSaved = async () => {
        try {
            const res = await axios.get(`${SAVED_JOBS_API_END_POINT}/check/${job._id}`, {
                withCredentials: true
            });
            if (res.data.success) {
                setIsSaved(res.data.isSaved);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkIfApplied = async () => {
        try {
            // Check for active application (not rejected)
            const hasActiveApplication = job?.applications?.some(
                application => application.applicant === user?._id && application.status !== 'rejected'
            ) || false;
            setIsApplied(hasActiveApplication);

            // Check for rejected application
            const hasRejectedApplication = job?.applications?.some(
                application => application.applicant === user?._id && application.status === 'rejected'
            ) || false;
            setIsRejected(hasRejectedApplication);
        } catch (error) {
            console.log(error);
        }
    };

    const handleApply = async () => {
        // Check if user is authenticated
        if (!user) {
            toast.error('Please login to apply for jobs');
            navigate('/login');
            return;
        }
        
        // Check if user is a student/seeker
        if (user.role !== 'student') {
            toast.error('Only job seekers can apply for jobs');
            return;
        }

        setApplyLoading(true);
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${job._id}`, {
                withCredentials: true
            });
            if (res.data.success) {
                setIsApplied(true);
                setIsRejected(false); // Clear rejected status on reapply
                toast.success(res.data.message || 'Applied successfully');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to apply');
        } finally {
            setApplyLoading(false);
        }
    };

    const handleSaveToggle = async () => {
        // Check if user is authenticated
        if (!user) {
            toast.error('Please login to save jobs');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            if (isSaved) {
                // Unsave the job
                const res = await axios.delete(`${SAVED_JOBS_API_END_POINT}/unsave/${job._id}`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    setIsSaved(false);
                    toast.success('Job removed from saved');
                }
            } else {
                // Save the job
                const res = await axios.post(`${SAVED_JOBS_API_END_POINT}/save/${job._id}`, {}, {
                    withCredentials: true
                });
                if (res.data.success) {
                    setIsSaved(true);
                    toast.success('Job saved successfully');
                }
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to save job');
        } finally {
            setLoading(false);
        }
    };

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    };

    return (
        <div className='p-5 rounded-md shadow-xl bg-white border border-gray-100 h-[400px] sm:h-[420px] flex flex-col'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500'>
                    {daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
                </p>
                {/* ✅ Save Button */}
                <button
                    onClick={handleSaveToggle}
                    disabled={loading}
                    className='p-2 rounded-full hover:bg-gray-100 transition-colors'
                    title={!user ? 'Login to save jobs' : isSaved ? 'Remove from saved' : 'Save job'}
                >
                    <Bookmark 
                        className={`w-5 h-5 ${user && isSaved ? 'fill-current text-blue-600' : 'text-gray-600'}`}
                    />
                </button>
            </div>

            <div className='flex items-center gap-2 my-3'>
                <Button className="p-6" variant="outline" size="icon">
                    <Avatar>
                        <AvatarImage src={job?.company?.logo} />
                    </Avatar>
                </Button>
                <div className='flex-1 min-w-0'>
                    <h1 className='font-medium text-lg truncate'>{job?.company?.name}</h1>
                    <p className='text-sm text-gray-500'>India</p>
                </div>
            </div>

            <div className='flex-1 flex flex-col'>
                <h1 className='font-bold text-lg mb-2 line-clamp-1'>{job?.title}</h1>
                <p className='text-sm text-gray-600 flex-1 overflow-hidden line-clamp-4 leading-relaxed'>
                    {job?.description}
                </p>
            </div>

            <div className='flex flex-wrap items-center gap-2 mt-4 mb-4'>
                <Badge className={'text-blue-700 font-bold text-xs'} variant="ghost">
                    {job?.position} Positions
                </Badge>
                <Badge className={'text-[#F83002] font-bold text-xs'} variant="ghost">
                    {job?.jobType}
                </Badge>
                <Badge className={'text-[#7209b7] font-bold text-xs'} variant="ghost">
                    {job?.salary} LPA
                </Badge>
            </div>

            <div className='flex items-center gap-3'>
                <Button 
                    onClick={() => navigate(`/description/${job?._id}`)} 
                    variant="outline"
                    className='flex-1 text-sm py-2'
                >
                    Details
                </Button>
                <Button 
                    onClick={handleApply}
                    disabled={user && (isApplied || applyLoading)}
                    className={`flex-1 text-sm py-2 ${
                        !user 
                            ? 'bg-[#7209b7] hover:bg-[#5f32ad]' // Login to apply
                            : isApplied 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : isRejected
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-[#7209b7] hover:bg-[#5f32ad]'
                    }`}
                    title={!user ? 'Login to apply for jobs' : isRejected ? 'Improve your skills and reapply' : ''}
                >
                    {!user 
                        ? 'Login to Apply'
                        : applyLoading 
                        ? 'Applying...' 
                        : isApplied 
                        ? 'Applied' 
                        : isRejected 
                        ? 'Reapply' 
                        : 'Apply'
                    }
                </Button>
            </div>
        </div>
    );
};

export default Job;
