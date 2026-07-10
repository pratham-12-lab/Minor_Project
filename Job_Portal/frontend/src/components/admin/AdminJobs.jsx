import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button' 
import { useNavigate } from 'react-router-dom' 
import { useDispatch } from 'react-redux' 
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'
import { Briefcase, Plus, Search, TrendingUp } from 'lucide-react'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar />
      <div className='max-w-7xl mx-auto py-10 px-6'>
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white shadow-lg">
              <Briefcase className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Job Management
              </h1>
              <p className="text-xl text-gray-600 mt-2 font-medium flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Create and manage job listings
              </p>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                className="pl-12 pr-4 py-3 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50/50 transition-all duration-200"
                placeholder="Search jobs by title, role, location..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => navigate("/admin/jobs/create")}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
            >
              <Plus className="h-5 w-5 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <AdminJobsTable />
        </div>
      </div>
    </div>
  )
}

export default AdminJobs