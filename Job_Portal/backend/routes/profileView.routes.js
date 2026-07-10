import express from 'express';
import {
  trackProfileView,
  getMyProfileViews,
  getMyViews,
  addFakeViews
} from '../controllers/profileView.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { ProfileView } from '../models/profileView.model.js';

const router = express.Router();

// Track a profile view
router.post('/track/:profileId', isAuthenticated, trackProfileView);

// Get who viewed my profile
router.get('/my-views', isAuthenticated, getMyProfileViews);

// Get profiles I viewed
router.get('/my-visits', isAuthenticated, getMyViews);

// Add fake views for demo (remove in production)
router.post('/fake-views', isAuthenticated, addFakeViews);

// Clear all profile views (for testing)
router.delete('/clear-all', isAuthenticated, async (req, res) => {
  try {
    const userId = req.id;
    const result = await ProfileView.deleteMany({ viewedProfile: userId });
    
    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} profile views`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing profile views:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;