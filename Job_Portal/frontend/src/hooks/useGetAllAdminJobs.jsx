import { setAllAdminJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllAdminJobs = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
    
    useEffect(() => {
        // Add a delay to ensure Redux state is rehydrated
        const timeoutId = setTimeout(() => {
            setHasCheckedAuth(true);
        }, 100);

        return () => clearTimeout(timeoutId);
    }, []);
    
    useEffect(() => {
        if (!hasCheckedAuth) {
            console.log('🔄 Waiting for auth rehydration...');
            return;
        }

        // Check if user exists and has proper token
        const token = localStorage.getItem('token');
        console.log('🔍 Auth check:', { 
            hasUser: !!user, 
            userRole: user?.role, 
            hasToken: !!token 
        });

        // Only fetch admin jobs if user is authenticated and has admin/recruiter role
        if (!user || (user.role !== 'admin' && user.role !== 'recruiter')) {
            console.log('🔍 useGetAllAdminJobs: User not authorized', { 
                user: user?.role,
                hasUser: !!user,
                hasToken: !!token
            });
            dispatch(setAllAdminJobs([]));
            return;
        }

        if (!token) {
            console.log('❌ No token found in localStorage');
            dispatch(setAllAdminJobs([]));
            return;
        }

        const fetchAllAdminJobs = async () => {
            try {
                console.log('🔍 Fetching admin jobs for user:', { 
                    userId: user._id, 
                    role: user.role,
                    tokenExists: !!token
                });
                
                // Create axios config with proper authentication
                const config = {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                console.log('🔑 Making request with config:', {
                    url: `${JOB_API_END_POINT}/getadminjobs`,
                    hasAuthHeader: !!config.headers.Authorization,
                    tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
                });
                
                const res = await axios.get(`${JOB_API_END_POINT}/getadminjobs`, config);
                
                console.log('✅ Admin jobs API response:', res.data);
                
                if(res.data.success){
                    dispatch(setAllAdminJobs(res.data.jobs || []));
                } else {
                    console.log('❌ API returned success: false');
                    dispatch(setAllAdminJobs([]));
                }
            } catch (error) {
                console.error('❌ Error fetching admin jobs:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message,
                    config: error.config?.headers
                });
                
                // If unauthorized, clear the jobs
                if (error.response?.status === 401) {
                    console.log('🚫 Unauthorized - clearing admin jobs');
                }
                dispatch(setAllAdminJobs([]));
            }
        }
        
        fetchAllAdminJobs();
    }, [user, hasCheckedAuth, dispatch])
}

export default useGetAllAdminJobs