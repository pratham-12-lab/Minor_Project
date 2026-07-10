import express from "express";
import {
    createJobAlert,
    getJobAlerts,
    updateJobAlert,
    deleteJobAlert
} from "../controllers/jobAlert.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, createJobAlert);
router.route("/get").get(optionalAuth, getJobAlerts); // Allow anonymous for graceful handling
router.route("/update/:id").put(isAuthenticated, updateJobAlert);
router.route("/delete/:id").delete(isAuthenticated, deleteJobAlert);

export default router;
