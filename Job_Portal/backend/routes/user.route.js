import express from "express";
import { login, logout, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
 
const router = express.Router();
router.route("/register").post(authLimiter, singleUpload, register);
router.route("/login").post(authLimiter, login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);

export default router;
