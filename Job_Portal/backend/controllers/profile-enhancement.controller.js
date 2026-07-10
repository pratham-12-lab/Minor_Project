import { User } from '../models/user.model.js';

/**
 * Get user profile enhancements
 */
export const getProfileEnhancements = async (req, res) => {
    try {
        const userId = req.id; // From authentication middleware
        
        const user = await User.findById(userId).select('profileEnhancements');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Initialize empty profile enhancements if not exists
        const profileEnhancements = user.profileEnhancements || {
            professionalSummary: { summary: '', objectives: [], achievements: [] },
            workExperience: [],
            education: [],
            projects: [],
            certifications: [],
            socialLinks: []
        };

        return res.status(200).json({
            message: "Profile enhancements retrieved successfully",
            success: true,
            data: profileEnhancements
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

/**
 * Update professional summary
 */
export const updateProfessionalSummary = async (req, res) => {
    try {
        const userId = req.id;
        const { summary, objectives, achievements } = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (!user.profileEnhancements) {
            user.profileEnhancements = {};
        }

        user.profileEnhancements.professionalSummary = {
            summary: summary || '',
            objectives: objectives || [],
            achievements: achievements || []
        };

        await user.save();

        return res.status(200).json({
            message: "Professional summary updated successfully",
            success: true,
            data: user.profileEnhancements.professionalSummary
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

/**
 * Update work experience
 */
export const updateWorkExperience = async (req, res) => {
    try {
        const userId = req.id;
        const workExperience = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (!user.profileEnhancements) {
            user.profileEnhancements = {};
        }

        user.profileEnhancements.workExperience = workExperience || [];

        await user.save();

        return res.status(200).json({
            message: "Work experience updated successfully",
            success: true,
            data: user.profileEnhancements.workExperience
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

/**
 * Update education
 */
export const updateEducation = async (req, res) => {
    try {
        const userId = req.id;
        const education = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (!user.profileEnhancements) {
            user.profileEnhancements = {};
        }

        user.profileEnhancements.education = education || [];

        await user.save();

        return res.status(200).json({
            message: "Education updated successfully",
            success: true,
            data: user.profileEnhancements.education
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

/**
 * Update projects
 */
export const updateProjects = async (req, res) => {
    try {
        const userId = req.id;
        const projects = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (!user.profileEnhancements) {
            user.profileEnhancements = {};
        }

        user.profileEnhancements.projects = projects || [];

        await user.save();

        return res.status(200).json({
            message: "Projects updated successfully",
            success: true,
            data: user.profileEnhancements.projects
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

/**
 * Update certifications
 */
export const updateCertifications = async (req, res) => {
    try {
        const userId = req.id;
        const certifications = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (!user.profileEnhancements) {
            user.profileEnhancements = {};
        }

        user.profileEnhancements.certifications = certifications || [];

        await user.save();

        return res.status(200).json({
            message: "Certifications updated successfully",
            success: true,
            data: user.profileEnhancements.certifications
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

/**
 * Update social links
 */
export const updateSocialLinks = async (req, res) => {
    try {
        const userId = req.id;
        const socialLinks = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (!user.profileEnhancements) {
            user.profileEnhancements = {};
        }

        user.profileEnhancements.socialLinks = socialLinks || [];

        await user.save();

        return res.status(200).json({
            message: "Social links updated successfully",
            success: true,
            data: user.profileEnhancements.socialLinks
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};