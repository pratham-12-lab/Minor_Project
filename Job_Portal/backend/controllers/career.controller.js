import { User } from '../models/user.model.js';
import { Job } from '../models/job.model.js';
import { Skill, CareerPath } from '../models/careerPath.model.js';
import axios from 'axios';
import NodeCache from 'node-cache';

// Initialize cache with 24-hour TTL
const cache = new NodeCache({ stdTTL: 86400 });

// Mock skill data and alternatives
const mockSkillData = {
    // Programming Languages
    'javascript': { count: 85000, trend: 1, alternatives: ['TypeScript', 'Dart', 'CoffeeScript'] },
    'typescript': { count: 65000, trend: 1, alternatives: ['JavaScript', 'Dart'] },
    'python': { count: 90000, trend: 1, alternatives: ['Ruby', 'Java', 'JavaScript'] },
    'java': { count: 75000, trend: 0, alternatives: ['Kotlin', 'Scala', 'C#'] },
    'c#': { count: 60000, trend: 0, alternatives: ['Java', 'TypeScript', 'Go'] },
    'c++': { count: 45000, trend: -1, alternatives: ['Rust', 'Go', 'C'] },
    'php': { count: 30000, trend: -1, alternatives: ['Python', 'Ruby', 'JavaScript'] },
    'ruby': { count: 25000, trend: -1, alternatives: ['Python', 'JavaScript'] },
    'swift': { count: 35000, trend: 1, alternatives: ['Kotlin', 'Dart'] },
    'kotlin': { count: 40000, trend: 1, alternatives: ['Java', 'Swift'] },
    'go': { count: 50000, trend: 1, alternatives: ['Rust', 'Python', 'Java'] },
    'rust': { count: 30000, trend: 1, alternatives: ['Go', 'C++', 'Zig'] },
    
    // Frontend
    'react': { count: 80000, trend: 1, alternatives: ['Vue', 'Angular', 'Svelte'] },
    'vue': { count: 45000, trend: 0, alternatives: ['React', 'Angular', 'Svelte'] },
    'angular': { count: 40000, trend: -1, alternatives: ['React', 'Vue', 'Svelte'] },
    'svelte': { count: 20000, trend: 1, alternatives: ['React', 'Vue', 'Solid'] },
    'next.js': { count: 35000, trend: 1, alternatives: ['Gatsby', 'Nuxt', 'Remix'] },
    'gatsby': { count: 15000, trend: 0, alternatives: ['Next.js', 'Nuxt', 'SvelteKit'] },
    
    // Backend
    'node.js': { count: 70000, trend: 1, alternatives: ['Deno', 'Bun', 'Python'] },
    'express': { count: 60000, trend: 0, alternatives: ['Fastify', 'NestJS', 'Koa'] },
    'django': { count: 35000, trend: 0, alternatives: ['Flask', 'Ruby on Rails', 'Laravel'] },
    'flask': { count: 30000, trend: 0, alternatives: ['Django', 'FastAPI', 'Express'] },
    'spring boot': { count: 40000, trend: 0, alternatives: ['Micronaut', 'Quarkus', 'Dropwizard'] },
    'laravel': { count: 25000, trend: -1, alternatives: ['Django', 'Ruby on Rails', 'Express'] },
    
    // Databases
    'mongodb': { count: 50000, trend: 1, alternatives: ['PostgreSQL', 'MySQL', 'Firebase'] },
    'postgresql': { count: 55000, trend: 1, alternatives: ['MySQL', 'MongoDB', 'SQL Server'] },
    'mysql': { count: 50000, trend: 0, alternatives: ['PostgreSQL', 'MariaDB', 'MongoDB'] },
    'sql': { count: 70000, trend: 0, alternatives: ['NoSQL', 'GraphQL', 'Prisma'] },
    'redis': { count: 35000, trend: 1, alternatives: ['Memcached', 'Hazelcast', 'Infinispan'] },
    'firebase': { count: 40000, trend: 1, alternatives: ['MongoDB', 'Supabase', 'Appwrite'] },
    
    // Cloud & DevOps
    'aws': { count: 80000, trend: 1, alternatives: ['Google Cloud', 'Azure', 'DigitalOcean'] },
    'docker': { count: 70000, trend: 1, alternatives: ['Podman', 'Kubernetes', 'LXC'] },
    'kubernetes': { count: 60000, trend: 1, alternatives: ['Docker Swarm', 'Nomad', 'OpenShift'] },
    'terraform': { count: 40000, trend: 1, alternatives: ['Pulumi', 'AWS CDK', 'Crossplane'] },
    'jenkins': { count: 35000, trend: -1, alternatives: ['GitHub Actions', 'GitLab CI', 'CircleCI'] },
    
    // Mobile
    'react native': { count: 45000, trend: 1, alternatives: ['Flutter', 'Ionic', 'Xamarin'] },
    'flutter': { count: 40000, trend: 1, alternatives: ['React Native', 'Kotlin', 'SwiftUI'] },
    'swiftui': { count: 30000, trend: 1, alternatives: ['UIKit', 'Flutter', 'React Native'] },
    'kotlin multiplatform': { count: 15000, trend: 1, alternatives: ['Flutter', 'React Native', 'Ionic'] },
    
    // AI/ML
    'tensorflow': { count: 35000, trend: 1, alternatives: ['PyTorch', 'Keras', 'MXNet'] },
    'pytorch': { count: 40000, trend: 1, alternatives: ['TensorFlow', 'JAX', 'MXNet'] },
    'opencv': { count: 30000, trend: 0, alternatives: ['SimpleCV', 'Dlib', 'Scikit-image'] },
    
    // Testing
    'jest': { count: 40000, trend: 1, alternatives: ['Mocha', 'Jasmine', 'Vitest'] },
    'cypress': { count: 35000, trend: 1, alternatives: ['Playwright', 'Puppeteer', 'Selenium'] },
    'playwright': { count: 30000, trend: 1, alternatives: ['Cypress', 'Puppeteer', 'TestCafe'] },
    
    // Other
    'graphql': { count: 45000, trend: 1, alternatives: ['REST', 'gRPC', 'tRPC'] },
    'rest': { count: 80000, trend: 0, alternatives: ['GraphQL', 'gRPC', 'tRPC'] },
    'webassembly': { count: 20000, trend: 1, alternatives: ['JavaScript', 'Rust', 'AssemblyScript'] }
};

// Helper function to calculate skill match score
const calculateSkillMatch = (requiredSkills, userSkills) => {
    const userSkillSet = new Set(userSkills.map(skill => skill.toLowerCase()));
    let matchScore = 0;
    let totalWeight = 0;
    
    requiredSkills.forEach(({ skill, importance }) => {
        const skillLower = skill.toLowerCase();
        if (userSkillSet.has(skillLower)) {
            matchScore += importance * 2; // Higher weight for direct matches
        } else {
            // Check for alternative skills
            const skillData = mockSkillData[skillLower] || {};
            if (skillData.alternatives) {
                const hasAlternative = skillData.alternatives.some(alt => 
                    userSkillSet.has(alt.toLowerCase())
                );
                if (hasAlternative) matchScore += importance;
            }
        }
        totalWeight += importance;
    });
    
    return totalWeight > 0 ? (matchScore / totalWeight) * 100 : 0;
};

// Update skill data using mock data
const updateSkillData = async (skillName) => {
    try {
        const cacheKey = `skill_${skillName}`;
        const cachedData = cache.get(cacheKey);
        
        if (cachedData) {
            return cachedData;
        }

        // Get mock data or use defaults
        const skillLower = skillName.toLowerCase();
        const mockData = mockSkillData[skillLower] || {
            count: Math.floor(Math.random() * 50000) + 1000,
            trend: Math.random() > 0.5 ? 1 : -1,
            alternatives: []
        };

        const skillData = {
            name: skillName,
            count: mockData.count,
            trend: mockData.trend,
            alternatives: mockData.alternatives,
            lastUpdated: Date.now()
        };

        // Cache the data
        cache.set(cacheKey, skillData);
        
        // Save to database
        await Skill.findOneAndUpdate(
            { name: skillName },
            { $set: skillData },
            { upsert: true, new: true }
        );

        return skillData;
    } catch (error) {
        console.error(`Error updating skill data for ${skillName}:`, error);
        return {
            name: skillName,
            count: Math.floor(Math.random() * 50000) + 1000,
            trend: Math.random() > 0.5 ? 1 : -1,
            alternatives: [],
            lastUpdated: Date.now()
        };
    }
};

export const getCareerTrajectory = async (req, res) => {
    try {
        const user = await User.findById(req.id).select('profile.skills profile.experience careerGoals');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userSkills = user.profile?.skills || [];
        const experience = user.profile?.experience || 0;
        
        // Get all career paths that match user's experience level
        const experienceLevel = experience < 2 ? 'Entry' : 
                              experience < 5 ? 'Mid' : 
                              experience < 10 ? 'Senior' : 'Lead';
        
        const careerPaths = await CareerPath.find({ 
            $or: [
                { level: experienceLevel },
                { level: { $in: [experienceLevel, getNextLevel(experienceLevel)] } }
            ]
        });

        // Calculate match scores for each career path
        const pathsWithScores = await Promise.all(
            careerPaths.map(async (path) => {
                const matchScore = calculateSkillMatch(path.requiredSkills, userSkills);
                const skillGaps = path.requiredSkills
                    .filter(skill => !userSkills.includes(skill.skill))
                    .sort((a, b) => b.importance - a.importance);
                
                return {
                    ...path.toObject(),
                    matchScore: Math.round(matchScore),
                    skillGaps: skillGaps.slice(0, 5), // Top 5 skill gaps
                    nextSteps: path.nextSteps || []
                };
            })
        );

        // Sort by match score and get top 5
        const recommendedPaths = pathsWithScores
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);

        res.status(200).json({
            currentLevel: experienceLevel,
            recommendedPaths,
            skillsAnalysis: await analyzeSkills(userSkills)
        });

    } catch (error) {
        console.error('Error in getCareerTrajectory:', error);
        res.status(500).json({ 
            message: 'Failed to generate career trajectory',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to get next career level
function getNextLevel(currentLevel) {
    const levels = ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
}

// Analyze user's skills and suggest improvements
async function analyzeSkills(skills) {
    const skillAnalysis = await Promise.all(
        skills.map(async (skill) => {
            const skillData = await updateSkillData(skill);
            if (!skillData) return null;
            
            return {
                skill,
                demand: skillData.count,
                trend: skillData.trend,
                alternatives: skillData.alternatives || [],
                lastUpdated: skillData.lastUpdated
            };
        })
    );

    // Filter out nulls and sort by demand
    return skillAnalysis
        .filter(Boolean)
        .sort((a, b) => b.demand - a.demand);
}

export const getSkillCurrency = async (req, res) => {
    try {
        const user = await User.findById(req.id).select('profile.skills');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const skillsAnalysis = await analyzeSkills(user.profile?.skills || []);
        
        // Identify skills that might need updating
        const skillsToUpdate = skillsAnalysis
            .filter(skill => skill.trend < 0) // Skills with decreasing trend
            .map(skill => ({
                skill: skill.skill,
                trend: skill.trend,
                alternatives: skill.alternatives,
                recommendation: 'Consider updating to more in-demand technologies'
            }));

        res.status(200).json({
            skillsAnalysis,
            recommendations: skillsToUpdate,
            lastUpdated: new Date()
        });

    } catch (error) {
        console.error('Error in getSkillCurrency:', error);
        res.status(500).json({ 
            message: 'Failed to analyze skill currency',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add a new endpoint to get specific career path details
export const getCareerPathDetails = async (req, res) => {
    try {
        const { title, level } = req.params;
        const careerPath = await CareerPath.findOne({ title, level });
        
        if (!careerPath) {
            return res.status(404).json({ message: 'Career path not found' });
        }

        // Get related jobs from the database
        const relatedJobs = await Job.find({
            title: new RegExp(title, 'i'),
            'requirements': { $in: careerPath.requiredSkills.map(s => s.skill) }
        }).limit(5);

        res.status(200).json({
            ...careerPath.toObject(),
            relatedJobs,
            averageSalary: careerPath.averageSalary || {
                min: 50000,
                max: 150000,
                currency: 'USD'
            }
        });
    } catch (error) {
        console.error('Error in getCareerPathDetails:', error);
        res.status(500).json({ 
            message: 'Failed to get career path details',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};