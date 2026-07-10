import { setSingleCompany } from '@/redux/companySlice'
// eslint-disable-next-line no-unused-vars
import { setAllJobs } from '@/redux/jobSlice'
import { COMPANY_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetCompanyById = (companyId) => {
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
        if (!hasCheckedAuth || !companyId) {
            console.log('🔄 Waiting for auth rehydration or missing companyId...');
            return;
        }

        const token = localStorage.getItem('token');
        if (!user || !token) {
            console.log('❌ No user or token found for company by ID');
            return;
        }

        const fetchSingleCompany = async () => {
            try {
                console.log('🔍 Fetching company by ID:', { companyId, userId: user._id });

                const config = {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                const res = await axios.get(`${COMPANY_API_END_POINT}/get/${companyId}`, config);
                
                console.log('✅ Company by ID API response:', res.data);
                
                if(res.data.success){
                    dispatch(setSingleCompany(res.data.company));
                } else {
                    console.log('❌ Company by ID API returned success: false');
                }
            } catch (error) {
                console.error('❌ Error fetching company by ID:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });
            }
        }
        fetchSingleCompany();
    }, [companyId, dispatch, user, hasCheckedAuth])
}

export default useGetCompanyById