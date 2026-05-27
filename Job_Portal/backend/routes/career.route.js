import express from 'express';
import { getCareerTrajectory, getSkillCurrency } from '../controllers/career.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.route('/trajectory').get(isAuthenticated, getCareerTrajectory);
router.route('/skill-currency').get(isAuthenticated, getSkillCurrency);

export default router;
