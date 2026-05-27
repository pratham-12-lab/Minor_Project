import express from "express";
import { 
  postJob, 
  getAllJobs, 
  getJobById, 
  getAdminJobs,
  getFilteredJobs,  // ✅ Import this
  updateJob
} from "../controllers/job.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { checkEmployerVerification } from "../middlewares/checkVerification.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, checkEmployerVerification, postJob);
router.route("/update/:id").put(isAuthenticated, checkEmployerVerification, updateJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/search").get(isAuthenticated, getFilteredJobs); // ✅ Advanced search
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);

export default router;
