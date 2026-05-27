import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SkillCurrency = () => {
    const [skillsData, setSkillsData] = useState({
        skillsAnalysis: [],
        recommendations: [],
        lastUpdated: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSkillCurrency = async () => {
            try {
                const res = await axios.get('/api/career/skill-currency', { 
                    withCredentials: true 
                });
                setSkillsData({
                    skillsAnalysis: Array.isArray(res.data.skillsAnalysis) ? res.data.skillsAnalysis : [],
                    recommendations: Array.isArray(res.data.recommendations) ? res.data.recommendations : [],
                    lastUpdated: res.data.lastUpdated
                });
                setError(null);
            } catch (error) {
                console.error('Error fetching skill data:', error);
                setError('Failed to load skill data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchSkillCurrency();
    }, []);

    if (loading) {
        return <div className="p-6">Loading skill analysis...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">{error}</div>;
    }

    const getTrendStatus = (trend) => {
        const trendValue = trend ?? 0;
        if (trendValue > 0) return { text: 'Growing', class: 'bg-green-100 text-green-800' };
        if (trendValue < 0) return { text: 'Declining', class: 'bg-red-100 text-red-800' };
        return { text: 'Stable', class: 'bg-blue-100 text-blue-800' };
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Skill Currency Analysis</h2>
            
            {skillsData.lastUpdated && (
                <p className="text-sm text-gray-500 mb-6">
                    Last updated: {new Date(skillsData.lastUpdated).toLocaleString()}
                </p>
            )}

            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Your Skills Analysis</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {skillsData.skillsAnalysis.map((skill) => {
                        const trend = getTrendStatus(skill.trend);
                        return (
                            <div 
                                key={skill.skill} 
                                className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-lg text-gray-800">{skill.skill || 'Unnamed Skill'}</h4>
                                    <span className={`px-2 py-1 text-xs rounded-full ${trend.class}`}>
                                        {trend.text}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-2">
                                    Demand: {skill.demand?.toLocaleString() || 'N/A'} job posts
                                </p>
                                
                                {skill.alternatives && skill.alternatives.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-sm font-medium text-gray-700">Alternative skills:</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {skill.alternatives.map(alt => (
                                                <span 
                                                    key={alt} 
                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                                >
                                                    {alt}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {skillsData.recommendations && skillsData.recommendations.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Recommendations</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        {skillsData.recommendations.map((rec, index) => (
                            <li key={index} className="text-yellow-700">
                                <span className="font-medium">{rec.skill || 'Skill'}:</span> {rec.recommendation || 'No specific recommendation available.'}
                                {rec.alternatives && rec.alternatives.length > 0 && (
                                    <span> Consider: {rec.alternatives.join(', ')}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {skillsData.skillsAnalysis.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    No skill data available. Please update your profile with your skills.
                </div>
            )}
        </div>
    );
};

export default SkillCurrency;