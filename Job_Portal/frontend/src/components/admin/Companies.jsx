import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'
import { Building2, Plus, Search } from 'lucide-react'

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(setSearchCompanyByText(input));
    },[input]);
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Navbar />
            <div className='max-w-7xl mx-auto py-10 px-6'>
                {/* Header Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-white shadow-lg">
                            <Building2 className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Companies
                            </h1>
                            <p className="text-xl text-gray-600 mt-2 font-medium">
                                Manage and oversee all registered companies
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
                                className="pl-12 pr-4 py-3 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200"
                                placeholder="Search companies by name..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <Button 
                            onClick={() => navigate("/admin/companies/create")}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            New Company
                        </Button>
                    </div>
                </div>

                {/* Companies Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                    <CompaniesTable/>
                </div>
            </div>
        </div>
    )
}

export default Companies