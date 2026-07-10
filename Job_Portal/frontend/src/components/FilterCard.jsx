import React, { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

const FilterCard = ({ filters, onFilterChange, isMobile = false, isOpen = false, onClose }) => {
  // Search states
  const [locationSearch, setLocationSearch] = useState('');
  const [jobTypeSearch, setJobTypeSearch] = useState('');
  const [experienceSearch, setExperienceSearch] = useState('');

  // Dropdown states
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showJobTypeDropdown, setShowJobTypeDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleSelection = (field, value) => {
    onFilterChange({ [field]: value });
    if (field === 'location') {
      setLocationSearch('');
      setShowLocationDropdown(false);
    } else if (field === 'jobType') {
      setJobTypeSearch('');
      setShowJobTypeDropdown(false);
    } else if (field === 'experienceLevel') {
      setExperienceSearch('');
      setShowExperienceDropdown(false);
    }
  };

  const handleLocationKeyPress = (e) => {
    if (e.key === 'Enter' && locationSearch.trim()) {
      handleSelection('location', locationSearch.trim());
    }
  };

  const clearSelection = (field) => {
    onFilterChange({ [field]: '' });
  };

  const clearAllFilters = () => {
    onFilterChange({
      location: '',
      jobType: '',
      experienceLevel: '',
      salaryMin: '',
      salaryMax: '',
      skills: '',
      dateFrom: ''
    });
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(value => value && value !== '').length;

  // Suggested options
  const suggestedLocations = ['Bangalore', 'Delhi NCR', 'Hyderabad', 'Pune', 'Mumbai', 'Chennai', 'Kolkata', 'Ahmedabad', 'Noida', 'Gurgaon'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance', 'Remote'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Director'];

  const filteredLocations = suggestedLocations.filter(loc => 
    loc.toLowerCase().includes(locationSearch.toLowerCase())
  );
  const filteredJobTypes = jobTypes.filter(type => 
    type.toLowerCase().includes(jobTypeSearch.toLowerCase())
  );
  const filteredExperience = experienceLevels.filter(exp => 
    exp.toLowerCase().includes(experienceSearch.toLowerCase())
  );

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-[#6A38C2] text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Clear All Filters */}
      {activeFilterCount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}</span>
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-800">
            Clear All
          </Button>
        </div>
      )}
      
      {/* Location Search */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Location</Label>
        
        {filters.location ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-md">
            <span className="text-sm text-green-800">{filters.location}</span>
            <X 
              className="h-4 w-4 cursor-pointer text-green-600 hover:text-green-800" 
              onClick={() => clearSelection('location')}
            />
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Type any location or press Enter..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              onKeyPress={handleLocationKeyPress}
              onFocus={() => setShowLocationDropdown(true)}
              className="w-full pl-9"
            />

            {showLocationDropdown && (
              <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
                {filteredLocations.length > 0 && (
                  <>
                    <div className="p-2 text-xs text-gray-500 font-semibold">Suggested Locations</div>
                    {filteredLocations.map((loc) => (
                      <div 
                        key={loc} 
                        className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                        onClick={() => handleSelection('location', loc)}
                      >
                        {loc}
                      </div>
                    ))}
                  </>
                )}
                
                {locationSearch.trim() && (
                  <div 
                    className="p-2 hover:bg-green-50 cursor-pointer text-sm border-t border-gray-200 text-green-700 font-medium"
                    onClick={() => handleSelection('location', locationSearch.trim())}
                  >
                    ✓ Use "{locationSearch.trim()}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Job Type Search */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Job Type</Label>

        {filters.jobType ? (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-3 py-2 rounded-md">
            <span className="text-sm text-blue-800">{filters.jobType}</span>
            <X 
              className="h-4 w-4 cursor-pointer text-blue-600 hover:text-blue-800" 
              onClick={() => clearSelection('jobType')}
            />
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search job type..."
              value={jobTypeSearch}
              onChange={(e) => setJobTypeSearch(e.target.value)}
              onFocus={() => setShowJobTypeDropdown(true)}
              className="w-full pl-9"
            />

            {showJobTypeDropdown && (
              <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
                {filteredJobTypes.length > 0 ? (
                  filteredJobTypes.map((type) => (
                    <div 
                      key={type} 
                      className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                      onClick={() => handleSelection('jobType', type)}
                    >
                      {type}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">No job types found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Experience Search */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Experience</Label>

        {filters.experienceLevel ? (
          <div className="flex items-center justify-between bg-purple-50 border border-purple-200 px-3 py-2 rounded-md">
            <span className="text-sm text-purple-800">{filters.experienceLevel}</span>
            <X 
              className="h-4 w-4 cursor-pointer text-purple-600 hover:text-purple-800" 
              onClick={() => clearSelection('experienceLevel')}
            />
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search experience level..."
              value={experienceSearch}
              onChange={(e) => setExperienceSearch(e.target.value)}
              onFocus={() => setShowExperienceDropdown(true)}
              className="w-full pl-9"
            />

            {showExperienceDropdown && (
              <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
                {filteredExperience.length > 0 ? (
                  filteredExperience.map((exp) => (
                    <div 
                      key={exp} 
                      className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                      onClick={() => handleSelection('experienceLevel', exp)}
                    >
                      {exp}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-sm text-gray-500">No experience levels found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Salary Range */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Salary Range (LPA)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.salaryMin}
            onChange={(e) => handleInputChange('salaryMin', e.target.value)}
            className="w-1/2"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.salaryMax}
            onChange={(e) => handleInputChange('salaryMax', e.target.value)}
            className="w-1/2"
          />
        </div>
      </div>

      {/* Skills */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Skills (comma-separated)</Label>
        <Input
          type="text"
          placeholder="e.g. React, Node, MongoDB"
          value={filters.skills}
          onChange={(e) => handleInputChange('skills', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Date Filter */}
      <div>
        <Label className="font-semibold text-sm mb-2 block">Posted After</Label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleInputChange('dateFrom', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Mobile Apply Filters Button */}
      {isMobile && (
        <div className="pt-4 border-t">
          <Button onClick={onClose} className="w-full bg-[#6A38C2] hover:bg-[#5b30a6]">
            Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      )}

      {/* Overlay to close dropdowns */}
      {(showLocationDropdown || showJobTypeDropdown || showExperienceDropdown) && (
        <div 
          className="fixed inset-0 z-[5]" 
          onClick={() => {
            setShowLocationDropdown(false);
            setShowJobTypeDropdown(false);
            setShowExperienceDropdown(false);
          }}
        />
      )}
    </div>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Mobile Drawer */}
        <div className={`
          fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl z-50 md:hidden
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          max-h-[85vh] overflow-y-auto
        `}>
          <div className="p-4">
            <FilterContent />
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="hidden md:block w-full bg-white p-4 rounded-md shadow-sm border border-gray-200 sticky top-5">
      <FilterContent />
    </div>
  );
};

// Mobile Filter Button Component
export const MobileFilterButton = ({ onOpen, activeFilterCount }) => (
  <Button 
    onClick={onOpen}
    variant="outline" 
    className="md:hidden flex items-center gap-2 bg-white border-gray-300"
  >
    <Filter className="h-4 w-4" />
    Filters
    {activeFilterCount > 0 && (
      <span className="bg-[#6A38C2] text-white text-xs px-2 py-1 rounded-full">
        {activeFilterCount}
      </span>
    )}
  </Button>
);

export default FilterCard;
