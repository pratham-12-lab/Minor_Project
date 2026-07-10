import express from "express";
import {
    saveJob,
    unsaveJob,
    getSavedJobs,
    checkJobSaved
} from "../controllers/savedJob.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();

router.route("/save/:id").post(isAuthenticated, saveJob);
router.route("/unsave/:id").delete(isAuthenticated, unsaveJob);
router.route("/get").get(optionalAuth, getSavedJobs); // Handle anonymous users gracefully
router.route("/check/:id").get(optionalAuth, checkJobSaved); // Allow anonymous users

export default router;
