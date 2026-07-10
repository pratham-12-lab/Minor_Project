import { ProfileView } from "../models/profileView.model.js";
import { User } from "../models/user.model.js";
import notificationHandler from "../websocket/notification-handler.js";

// ✅ TRACK PROFILE VIEW
export const trackProfileView = async (req, res) => {
  try {
    const viewerId = req.id;
    const { profileId } = req.params;
    const { 
      viewType = 'profile', 
      context = {},
      timeSpent = 0,
      actionsPerformed = [] 
    } = req.body;

    // Don't track self-views
    if (viewerId === profileId) {
      return res.status(200).json({
        success: true,
        message: "Self-view not tracked"
      });
    }

    // Check if profile exists
    const profileUser = await User.findById(profileId);
    if (!profileUser) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Check for recent view (within last hour) to avoid spam
    const recentView = await ProfileView.findOne({
      viewer: viewerId,
      viewedProfile: profileId,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    if (recentView) {
      // Update existing view
      recentView.viewCount += 1;
      recentView.timeSpent += timeSpent;
      recentView.actionsPerformed.push(...actionsPerformed);
      recentView.isUnique = false;
      
      // Update interest level based on actions
      const highInterestActions = ['download-resume', 'contact', 'save-candidate'];
      const hasHighInterestActions = actionsPerformed.some(action => 
        highInterestActions.includes(action.action)
      );
      
      if (hasHighInterestActions) {
        recentView.interestLevel = 'high';
      } else if (timeSpent > 120 || actionsPerformed.length > 3) {
        recentView.interestLevel = 'medium';
      }
      
      await recentView.save();
      
      return res.status(200).json({
        success: true,
        message: "Profile view updated",
        view: recentView
      });
    }

    // Create new view record
    const profileView = await ProfileView.create({
      viewer: viewerId,
      viewedProfile: profileId,
      viewType,
      context,
      timeSpent,
      actionsPerformed,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      interestLevel: timeSpent > 120 ? 'medium' : 'low'
    });

    // Get viewer details for notification
    const viewer = await User.findById(viewerId).select('fullname role profile.profilePhoto');

    // Send notification to profile owner (async, don't wait)
    const socketManager = req.app.get('socketManager');
    if (socketManager && viewer.role === 'recruiter') {
      // Only notify if viewer is a recruiter
      notificationHandler.sendNotification(
        profileId,
        {
          type: 'PROFILE_VIEW',
          title: 'Profile View',
          message: `${viewer.fullname || 'A recruiter'} viewed your profile`,
          actionUrl: `/student/profile/views`,
          relatedId: profileView._id,
        },
        socketManager
      ).catch(err => console.error('Profile view notification error:', err));
    }

    return res.status(201).json({
      success: true,
      message: "Profile view tracked",
      view: profileView
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET PROFILE VIEWS (who viewed my profile)
export const getMyProfileViews = async (req, res) => {
  try {
    const userId = req.id;
    const { page = 1, limit = 20, timeframe = 'all' } = req.query;

    let query = { viewedProfile: userId };

    // Filter by timeframe
    if (timeframe !== 'all') {
      const now = new Date();
      switch (timeframe) {
        case 'today':
          query.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
          break;
        case 'week':
          query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
          break;
        case 'month':
          query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
          break;
      }
    }

    const views = await ProfileView.find(query)
      .populate('viewer', 'fullname role profile.profilePhoto companyName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalViews = await ProfileView.countDocuments(query);
    const uniqueViews = await ProfileView.distinct('viewer', query).length;

    // Get analytics
    const analytics = await ProfileView.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 },
          totalTimeSpent: { $sum: '$timeSpent' },
          highInterestViews: {
            $sum: { $cond: [{ $eq: ['$interestLevel', 'high'] }, 1, 0] }
          },
          recruiterViews: { $sum: 1 } // Will be filtered in the populate
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      views,
      analytics: {
        totalViews: analytics[0]?.totalViews || 0,
        uniqueViews,
        averageTimeSpent: analytics[0]?.totalViews 
          ? Math.round(analytics[0].totalTimeSpent / analytics[0].totalViews) 
          : 0,
        highInterestViews: analytics[0]?.highInterestViews || 0
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalViews / limit),
        totalItems: totalViews
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET VIEWS I MADE (profiles I viewed)
export const getMyViews = async (req, res) => {
  try {
    const userId = req.id;
    const { page = 1, limit = 20, timeframe = 'all' } = req.query;

    let query = { viewer: userId };

    // Filter by timeframe
    if (timeframe !== 'all') {
      const now = new Date();
      switch (timeframe) {
        case 'today':
          query.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
          break;
        case 'week':
          query.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
          break;
        case 'month':
          query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
          break;
      }
    }

    const views = await ProfileView.find(query)
      .populate('viewedProfile', 'fullname profile.profilePhoto profile.skills')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalViews = await ProfileView.countDocuments(query);

    return res.status(200).json({
      success: true,
      views,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalViews / limit),
        totalItems: totalViews
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ ADD FAKE PROFILE VIEWS (for demo purposes)
export const addFakeViews = async (req, res) => {
  try {
    const userId = req.id;
    const { count = 5 } = req.body;

    // Get some random recruiters to simulate views
    const recruiters = await User.find({ 
      role: 'recruiter',
      _id: { $ne: userId }
    }).limit(10);

    if (recruiters.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No recruiters found to simulate views"
      });
    }

    const fakeViews = [];
    for (let i = 0; i < count; i++) {
      const randomRecruiter = recruiters[Math.floor(Math.random() * recruiters.length)];
      const randomTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time within last 7 days
      
      const view = await ProfileView.create({
        viewer: randomRecruiter._id,
        viewedProfile: userId,
        viewType: 'profile',
        timeSpent: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
        interestLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        createdAt: randomTime,
        context: {
          source: ['job-application', 'candidate-search', 'recommendation'][Math.floor(Math.random() * 3)]
        }
      });

      fakeViews.push(view);
    }

    // Send a notification
    const socketManager = req.app.get('socketManager');
    if (socketManager) {
      await notificationHandler.sendNotification(
        userId,
        {
          type: 'PROFILE_VIEW',
          title: 'Profile Views Update',
          message: `${count} new profile views added to your profile!`,
          actionUrl: `/student/profile/views`,
          relatedId: null,
        },
        socketManager
      );
    }

    return res.status(201).json({
      success: true,
      message: `${count} fake profile views added successfully!`,
      views: fakeViews
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};