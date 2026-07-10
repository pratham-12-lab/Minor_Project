import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='text-center px-4 sm:px-6 lg:px-8'>
            <div className='flex flex-col gap-5 my-10 sm:my-16 lg:my-20'>
                <span className='mx-auto px-4 py-2 rounded-full bg-gray-100 text-[#F83002] font-medium text-sm sm:text-base'>
                    No. 1 Job Hunt Website
                </span>
                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
                    Search, Apply & <br className='hidden sm:block' /> 
                    Get Your <span className='text-[#6A38C2]'>Dream Jobs</span>
                </h1>
                <p className='text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto'>
                    Welcome To Jobs Portal to Explore the Jobs and Find Your Perfect Career Match
                </p>
                <div className='flex w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl shadow-lg border border-gray-200 pl-3 rounded-full items-center gap-4 mx-auto'>
                    <input
                        type="text"
                        placeholder='Find your dream jobs'
                        onChange={(e) => setQuery(e.target.value)}
                        className='outline-none border-none w-full py-2 sm:py-3 text-sm sm:text-base'
                    />
                    <Button 
                        onClick={searchJobHandler} 
                        className="rounded-r-full bg-[#6A38C2] hover:bg-[#5b30a6] px-4 sm:px-6 py-2 sm:py-3"
                    >
                        <Search className='h-4 w-4 sm:h-5 sm:w-5' />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default HeroSection