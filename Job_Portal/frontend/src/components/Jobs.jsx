import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import FilterCard, { MobileFilterButton } from './FilterCard';
import Job from './Job';
import axios from 'axios';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { JOB_API_END_POINT } from '@/utils/constant';
import { Loader2, Search, SlidersHorizontal, Briefcase, MapPin, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Jobs = () => {
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    skills: '',
    dateFrom: '',
    page: 1,
    limit: 9,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [searchInput, setSearchInput] = useState(''); // For controlled search input
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    jobsPerPage: 9
  });

  // ✅ Fetch jobs whenever filters change
  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(
        `${JOB_API_END_POINT}/search?${params.toString()}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        setJobs(res.data.jobs || []);
        setPagination(res.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalJobs: 0,
          jobsPerPage: 9
        });
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Fetch jobs error:', err);
      if (err.response?.status === 401) {
        setError('Please login to view jobs');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch jobs');
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({
      ...filters,
      keyword: searchInput,
      page: 1
    });
  };

  // ✅ Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1
    });
  };

  // ✅ Handle page change
  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Clear all filters
  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      keyword: '',
      location: '',
      jobType: '',
      experienceLevel: '',
      salaryMin: '',
      salaryMax: '',
      skills: '',
      dateFrom: '',
      page: 1,
      limit: 9,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Count active filters for mobile button
  const activeFilterCount = Object.values(filters).filter(value => 
    value && value !== '' && value !== 1 && value !== 9 && value !== 'createdAt' && value !== 'desc'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navbar />
      
      {/* Hero Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
                <Briefcase className="h-8 w-8" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Find Your Dream Job
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover thousands of opportunities from top companies. Your next career move starts here.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-4 border border-orange-100">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-12 pr-4 py-4 text-lg border-0 focus:ring-2 focus:ring-orange-500 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-4 relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Location"
                      value={filters.location}
                      onChange={(e) => updateFilters({ location: e.target.value })}
                      className="pl-12 pr-4 py-4 text-lg border-0 focus:ring-2 focus:ring-orange-500 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Button
                      onClick={handleSearch}
                      className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Search Jobs
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-5 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by title, company, or skills..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6A38C2] focus:border-transparent"
            />
          </div>
          <Button 
            type="submit"
            className="bg-[#6A38C2] hover:bg-[#5b30a6] px-6 sm:px-8 py-3 rounded-lg font-medium"
          >
            <Search className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </form>

        {/* Mobile Filter Button */}
        <div className="flex items-center justify-between mb-4 md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">
            {pagination.totalJobs} Jobs Found
          </h2>
          <MobileFilterButton 
            onOpen={() => setMobileFilterOpen(true)}
            activeFilterCount={activeFilterCount}
          />
        </div>

        <div className="flex gap-6">
          {/* ✅ Desktop Filter Sidebar */}
          <div className="hidden md:block md:w-80 lg:w-96 flex-shrink-0">
            <FilterCard 
              filters={filters} 
              onFilterChange={handleFilterChange}
              isMobile={false}
            />
          </div>

          {/* ✅ Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* ✅ Results header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <div className="hidden md:block">
                <h1 className="font-bold text-xl lg:text-2xl text-gray-900">
                  {loading ? 'Loading...' : `${pagination.totalJobs} Jobs Found`}
                </h1>
                {pagination.totalJobs > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Showing {((pagination.currentPage - 1) * pagination.jobsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.jobsPerPage, pagination.totalJobs)} of {pagination.totalJobs}
                  </p>
                )}
              </div>

              {/* ✅ Sort dropdown */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange({ sortBy, sortOrder });
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6A38C2] focus:border-transparent text-sm"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="salary-desc">Highest Salary</option>
                  <option value="salary-asc">Lowest Salary</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                </select>
              </div>
            </div>

            {/* ✅ Job listings */}
            <div className="min-h-[60vh]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <Loader2 className="h-12 w-12 animate-spin text-[#6A38C2]" />
                  <p className="mt-4 text-gray-600">Loading amazing opportunities...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <Button onClick={fetchJobs} className="bg-[#6A38C2] hover:bg-[#5b30a6]">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md">
                    <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
                    <p className="text-gray-600 mb-4">We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.</p>
                    <Button onClick={clearFilters} className="bg-[#6A38C2] hover:bg-[#5b30a6]">
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-stretch">
                  {jobs.map((job, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      key={job?._id}
                      className="h-full"
                    >
                      <Job job={job} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ Pagination */}
            {!loading && !error && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 mb-8 px-4">
                <div className="flex items-center gap-2 order-2 sm:order-1">
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    Previous
                  </Button>

                  <div className="flex gap-1 sm:gap-2 overflow-x-auto max-w-xs sm:max-w-none">
                    {[...Array(pagination.totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            variant={pagination.currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className={
                              pagination.currentPage === pageNum
                                ? 'bg-[#6A38C2] hover:bg-[#5b30a6] text-white min-w-[2.5rem]'
                                : 'border-gray-300 min-w-[2.5rem]'
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      } else if (
                        pageNum === pagination.currentPage - 2 ||
                        pageNum === pagination.currentPage + 2
                      ) {
                        return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    Next
                  </Button>
                </div>

                <div className="text-sm text-gray-600 order-1 sm:order-2">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterCard 
        filters={filters} 
        onFilterChange={handleFilterChange}
        isMobile={true}
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
      />
    </div>
  );
};

export default Jobs;
