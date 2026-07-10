import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
    getProfileEnhancements,
    updateProfessionalSummary,
    updateWorkExperience,
    updateEducation,
    updateProjects,
    updateCertifications,
    updateSocialLinks
} from "../controllers/profile-enhancement.controller.js";

const router = express.Router();

// Get all profile enhancements
router.route("/get").get(isAuthenticated, getProfileEnhancements);

// Update individual sections
router.route("/professional-summary").put(isAuthenticated, updateProfessionalSummary);
router.route("/work-experience").put(isAuthenticated, updateWorkExperience);
router.route("/education").put(isAuthenticated, updateEducation);
router.route("/projects").put(isAuthenticated, updateProjects);
router.route("/certifications").put(isAuthenticated, updateCertifications);
router.route("/social-links").put(isAuthenticated, updateSocialLinks);

export default router;