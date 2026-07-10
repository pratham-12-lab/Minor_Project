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
router.route("/get").get(getAllJobs); // ✅ Make this public so guests can view jobs
router.route("/search").get(getFilteredJobs); // ✅ Make search public for guest browsing
router.route("/get/:id").get(getJobById); // ✅ Make individual job view public
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);

export default router;
