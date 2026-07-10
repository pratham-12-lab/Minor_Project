import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const {applicants} = useSelector(store=>store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                console.log('🔍 Fetching applicants for job ID:', params.id);
                const token = localStorage.getItem('token');
                console.log('🔍 Using token:', token ? 'Token exists' : 'No token found');
                
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { 
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    }
                });
                
                console.log('✅ API Response:', res.data);
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.log('❌ Error fetching applicants:', error);
                console.log('❌ Error response:', error.response?.data);
            }
        }
        fetchAllApplicants();
    }, []);
    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto'>
                <h1 className='font-bold text-xl my-5'>Applicants {applicants?.applications?.length}</h1>
                <ApplicantsTable />
            </div>
        </div>
    )
}

export default Applicants