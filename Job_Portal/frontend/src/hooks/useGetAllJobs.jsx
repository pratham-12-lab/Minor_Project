import { setAllJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const {searchedQuery} = useSelector(store=>store.job);
    const {user} = useSelector(store=>store.auth);
    
    useEffect(()=>{
        const fetchAllJobs = async () => {
            try {
                // Fetch jobs without authentication for public access
                const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`);
                if(res.data.success){
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
                // Set empty array on error to prevent crashes
                dispatch(setAllJobs([]));
            }
        }
        fetchAllJobs();
    },[searchedQuery])
}

export default useGetAllJobs