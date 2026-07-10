import { setCompanies} from '@/redux/companySlice'
import { COMPANY_API_END_POINT} from '@/utils/constant'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllCompanies = () => {
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
            console.log('🔄 Waiting for auth rehydration for companies...');
            return;
        }

        // Check if user exists and has proper token
        const token = localStorage.getItem('token');
        console.log('🔍 Companies Auth check:', { 
            hasUser: !!user, 
            userRole: user?.role, 
            hasToken: !!token 
        });

        if (!user || !token) {
            console.log('❌ No user or token found for companies');
            dispatch(setCompanies([]));
            return;
        }

        const fetchCompanies = async () => {
            try {
                console.log('🔍 Fetching companies for user:', { 
                    userId: user._id, 
                    role: user.role,
                    tokenExists: !!token
                });

                const config = {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                console.log('🔑 Making companies request with auth header');
                
                const res = await axios.get(`${COMPANY_API_END_POINT}/get`, config);
                
                console.log('✅ Companies API response:', res.data);
                
                if(res.data.success){
                    dispatch(setCompanies(res.data.companies || []));
                } else {
                    console.log('❌ Companies API returned success: false');
                    dispatch(setCompanies([]));
                }
            } catch (error) {
                console.error('❌ Error fetching companies:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
                dispatch(setCompanies([]));
            }
        }
        fetchCompanies();
    }, [user, hasCheckedAuth, dispatch])
}

export default useGetAllCompanies