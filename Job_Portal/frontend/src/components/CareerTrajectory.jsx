import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';

// Inline SVG Icons
const FiArrowUpRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

const FiTrendingUp = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const FiTrendingDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
    <polyline points="17 18 23 18 23 12"></polyline>
  </svg>
);

const FiTrendingFlat = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="12" x2="2" y2="12"></line>
    <polyline points="16 6 22 12 16 18"></polyline>
  </svg>
);

const CareerTrajectory = () => {
  const [trajectoryData, setTrajectoryData] = useState({
    currentLevel: '',
    recommendedPaths: [],
    skillsAnalysis: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCareerTrajectory = async () => {
      try {
        const res = await axios.get('/api/career/trajectory', { 
          withCredentials: true 
        });
        setTrajectoryData({
          currentLevel: res.data.currentLevel || 'Not specified',
          recommendedPaths: Array.isArray(res.data.recommendedPaths) 
            ? res.data.recommendedPaths 
            : [],
          skillsAnalysis: Array.isArray(res.data.skillsAnalysis) 
            ? res.data.skillsAnalysis 
            : []
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching career trajectory:', error);
        setError('Failed to load career trajectory. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCareerTrajectory();
  }, []);

  const getTrendIcon = (trend) => {
    const trendValue = trend ?? 0;
    if (trendValue > 0) return <FiTrendingUp className="inline ml-1" />;
    if (trendValue < 0) return <FiTrendingDown className="inline ml-1" />;
    return <FiTrendingFlat className="inline ml-1" />;
  };

  const handleDownloadReport = () => {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('Skills Analysis Report', 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add current level
    doc.setFontSize(14);
    doc.setTextColor(40, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Current Level:', 14, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(trajectoryData.currentLevel, 50, 45);
    
    // Add skills analysis section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Skills Analysis', 14, 65);
    doc.setFont('helvetica', 'normal');
    
    let yPosition = 75;
    doc.setFontSize(12);
    
    // Add skills
    trajectoryData.skillsAnalysis.forEach((skill, index) => {
      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Skill name
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 62, 80);
      doc.text(`${index + 1}. ${skill.skill || 'Unnamed Skill'}`, 14, yPosition);
      
      // Skill details
      doc.setFont('helvetica', 'normal');
      yPosition += 7;
      doc.text(`• Demand: ${skill.demand ? skill.demand.toLocaleString() + ' jobs' : 'Data not available'}`, 20, yPosition);
      
      yPosition += 7;
      const trend = skill.trend ?? 0;
      const trendText = trend > 0 ? 'Growing' : trend < 0 ? 'Declining' : 'Stable';
      doc.text(`• Trend: ${trendText}`, 20, yPosition);
      
      // Add alternatives if they exist
      if (skill.alternatives && skill.alternatives.length > 0) {
        yPosition += 7;
        doc.text(`• Alternatives: ${skill.alternatives.slice(0, 3).join(', ')}${skill.alternatives.length > 3 ? '...' : ''}`, 20, yPosition);
      }
      
      yPosition += 15; // Add extra space between skills
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save('skills-analysis-report.pdf');
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 max-w-6xl mx-auto"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-100 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 p-6 rounded-xl bg-white">
                <div className="h-6 bg-gray-100 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-6"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 max-w-6xl mx-auto"
      >
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 max-w-6xl mx-auto"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Career Journey</h1>
        <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Discover your potential career paths and the skills you need to get there
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Current Level</h2>
            <p className="text-gray-600">Your professional experience and skills</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {trajectoryData.currentLevel}
            </span>
          </div>
        </div>
      </div>

      {trajectoryData.skillsAnalysis && trajectoryData.skillsAnalysis.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Your Skills Analysis</h2>
            <p className="text-gray-600 mt-1">Overview of your current skills and their market demand</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {trajectoryData.skillsAnalysis.map((skill, index) => {
              const trend = skill.trend ?? 0;
              const trendClass = trend > 0 
                ? 'text-green-600 bg-green-50' 
                : trend < 0 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-blue-600 bg-blue-50';
              
              return (
                <motion.div 
                  key={skill.skill || index}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  className="bg-white border border-gray-100 rounded-xl p-5 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{skill.skill || 'Skill'}</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {skill.demand ? `${skill.demand.toLocaleString()}+ jobs` : 'Demand data not available'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trendClass}`}>
                      {trend > 0 ? 'Growing' : trend < 0 ? 'Declining' : 'Stable'}
                      {getTrendIcon(trend)}
                    </span>
                  </div>
                  
                  {skill.alternatives && skill.alternatives.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">ALTERNATIVES</p>
                      <div className="flex flex-wrap gap-2">
                        {skill.alternatives.slice(0, 3).map((alt, i) => (
                          <span 
                            key={alt || i} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {alt}
                          </span>
                        ))}
                        {skill.alternatives.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            +{skill.alternatives.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <button 
          onClick={handleDownloadReport}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Download Full Report
          <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default CareerTrajectory;