import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAppliedJobs = () => {
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
            console.log('🔄 Waiting for auth rehydration for applied jobs...');
            return;
        }

        // Only fetch applied jobs if user is authenticated
        if (!user) {
            console.log('❌ No user found for applied jobs');
            dispatch(setAllAppliedJobs([]));
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ No token found for applied jobs');
            dispatch(setAllAppliedJobs([]));
            return;
        }

        const fetchAppliedJobs = async () => {
            try {
                console.log('🔍 Fetching applied jobs for user:', { 
                    userId: user._id, 
                    role: user.role 
                });

                const config = {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                const res = await axios.get(`${APPLICATION_API_END_POINT}/get`, config);
                
                console.log('✅ Applied jobs API response:', res.data);
                
                if (res.data.success) {
                    dispatch(setAllAppliedJobs(res.data.applications || []));
                } else {
                    console.log('❌ Applied jobs API returned success: false');
                    dispatch(setAllAppliedJobs([]));
                }
            } catch (error) {
                console.error('❌ Error fetching applied jobs:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                dispatch(setAllAppliedJobs([]));
            }
        }
        fetchAppliedJobs();
    }, [dispatch, user, hasCheckedAuth]);
};

export default useGetAppliedJobs;
