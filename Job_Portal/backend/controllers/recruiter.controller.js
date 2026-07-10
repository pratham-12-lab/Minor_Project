import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { User } from "../models/user.model.js";
import { Interview } from "../models/interview.model.js";
import { ProfileView } from "../models/profileView.model.js";
import notificationHandler from "../websocket/notification-handler.js";

// ✅ RECRUITER DASHBOARD ANALYTICS
export const getRecruiterDashboard = async (req, res) => {
  try {
    const recruiterId = req.id;
    const { timeframe = '30' } = req.query; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));

    // Get recruiter's jobs
    const jobs = await Job.find({ created_by: recruiterId });
    const jobIds = jobs.map(job => job._id);

    // Applications analytics
    const applicationStats = await Application.aggregate([
      { $match: { job: { $in: jobIds }, createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Interview analytics
    const interviewStats = await Interview.aggregate([
      { $match: { recruiter: recruiterId, createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Profile views analytics
    const viewStats = await ProfileView.aggregate([
      { $match: { viewer: recruiterId, createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 },
          uniqueProfiles: { $addToSet: '$viewedProfile' }
        }
      }
    ]);

    // Job performance
    const jobPerformance = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: '$job',
          totalApplications: { $sum: 1 },
          acceptedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          pendingApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobDetails'
        }
      }
    ]);

    // Recent activity
    const recentApplications = await Application.find({ 
      job: { $in: jobIds } 
    })
      .populate('applicant', 'fullname profile.profilePhoto')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const upcomingInterviews = await Interview.find({
      recruiter: recruiterId,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('candidate', 'fullname profile.profilePhoto')
      .populate('job', 'title')
      .sort({ scheduledDate: 1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      dashboard: {
        overview: {
          totalJobs: jobs.length,
          totalApplications: applicationStats.reduce((sum, stat) => sum + stat.count, 0),
          totalInterviews: interviewStats.reduce((sum, stat) => sum + stat.count, 0),
          profileViews: viewStats[0]?.totalViews || 0,
          uniqueProfilesViewed: viewStats[0]?.uniqueProfiles?.length || 0
        },
        applicationStats: applicationStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        interviewStats: interviewStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        jobPerformance,
        recentActivity: {
          applications: recentApplications,
          interviews: upcomingInterviews
        }
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

// ✅ CANDIDATE SEARCH AND FILTER
export const searchCandidates = async (req, res) => {
  try {
    const {
      skills = [],
      location = '',
      experience = '',
      education = '',
      availability = '',
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    let query = { role: 'student' };
    let sortQuery = {};

    // Skills filter
    if (skills.length > 0) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.$or = [
        { 'profile.skills': { $in: skillsArray.map(skill => new RegExp(skill, 'i')) } },
        { 'profileEnhancements.workExperience.skills': { $in: skillsArray.map(skill => new RegExp(skill, 'i')) } }
      ];
    }

    // Location filter
    if (location) {
      query.$or = [
        ...(query.$or || []),
        { 'profileEnhancements.workExperience.location': new RegExp(location, 'i') }
      ];
    }

    // Experience filter
    if (experience) {
      // This would need more complex logic based on years of experience
    }

    // Education filter
    if (education) {
      query['profileEnhancements.education.degree'] = new RegExp(education, 'i');
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'experience':
        // Custom sorting logic for experience
        sortQuery = { 'profileEnhancements.workExperience': -1 };
        break;
      case 'activity':
        sortQuery = { updatedAt: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const candidates = await User.find(query)
      .select('fullname email profile profileEnhancements createdAt updatedAt')
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCandidates = await User.countDocuments(query);

    // Add matching score for each candidate
    const enhancedCandidates = candidates.map(candidate => {
      let matchScore = 0;
      
      // Skills matching
      if (skills.length > 0) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        const candidateSkills = [
          ...(candidate.profile?.skills || []),
          ...(candidate.profileEnhancements?.workExperience?.flatMap(exp => exp.skills || []) || [])
        ];
        
        const matchingSkills = skillsArray.filter(skill =>
          candidateSkills.some(candidateSkill =>
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        
        matchScore = skills.length > 0 ? (matchingSkills.length / skillsArray.length) * 100 : 0;
      }

      return {
        ...candidate.toObject(),
        matchScore: Math.round(matchScore)
      };
    });

    // Sort by match score if relevance sorting
    if (sortBy === 'relevance' && skills.length > 0) {
      enhancedCandidates.sort((a, b) => b.matchScore - a.matchScore);
    }

    return res.status(200).json({
      success: true,
      candidates: enhancedCandidates,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCandidates / limit),
        totalItems: totalCandidates
      },
      filters: {
        skills,
        location,
        experience,
        education,
        sortBy
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

// ✅ BULK ACTIONS ON APPLICATIONS
export const bulkUpdateApplications = async (req, res) => {
  try {
    const recruiterId = req.id;
    const { applicationIds, action, data = {} } = req.body;

    // Validate applications belong to recruiter
    const applications = await Application.find({
      _id: { $in: applicationIds }
    }).populate('job', 'created_by title');

    const unauthorizedApps = applications.filter(app => 
      app.job.created_by.toString() !== recruiterId
    );

    if (unauthorizedApps.length > 0) {
      return res.status(403).json({
        success: false,
        message: "Not authorized for some applications"
      });
    }

    let updateQuery = {};
    let results = [];

    switch (action) {
      case 'accept':
        updateQuery = { status: 'accepted' };
        break;
      case 'reject':
        updateQuery = { 
          status: 'rejected',
          rejectionReason: data.reason || 'Application did not meet requirements'
        };
        break;
      case 'schedule-interview':
        // This would require more complex logic
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action"
        });
    }

    // Update applications
    const result = await Application.updateMany(
      { _id: { $in: applicationIds } },
      updateQuery
    );

    // Send notifications to candidates
    const socketManager = req.app.get('socketManager');
    if (socketManager) {
      for (const application of applications) {
        const populatedApp = await Application.findById(application._id).populate('applicant');
        
        let notificationMessage = '';
        if (action === 'accept') {
          notificationMessage = `Congratulations! Your application for ${application.job.title} has been accepted.`;
        } else if (action === 'reject') {
          notificationMessage = `Your application for ${application.job.title} has been reviewed.`;
        }

        await notificationHandler.sendNotification(
          populatedApp.applicant._id,
          {
            type: 'APPLICATION',
            title: 'Application Update',
            message: notificationMessage,
            actionUrl: `/student/applications`,
            relatedId: application._id,
          },
          socketManager
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} applications updated successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ SAVE CANDIDATE FOR FUTURE
export const saveCandidate = async (req, res) => {
  try {
    const recruiterId = req.id;
    const { candidateId } = req.params;
    const { notes, tags = [] } = req.body;

    // Check if candidate exists
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    // For now, we'll use a simple approach - you might want to create a separate SavedCandidates model
    const recruiter = await User.findById(recruiterId);
    
    if (!recruiter.savedCandidates) {
      recruiter.savedCandidates = [];
    }

    // Check if already saved
    const alreadySaved = recruiter.savedCandidates.some(
      saved => saved.candidate?.toString() === candidateId
    );

    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: "Candidate already saved"
      });
    }

    // Add to saved candidates
    recruiter.savedCandidates.push({
      candidate: candidateId,
      notes,
      tags,
      savedAt: new Date()
    });

    await recruiter.save();

    // Track this as a profile view with high interest
    await ProfileView.create({
      viewer: recruiterId,
      viewedProfile: candidateId,
      viewType: 'profile',
      interestLevel: 'high',
      actionsPerformed: [{
        action: 'save-candidate',
        timestamp: new Date()
      }],
      context: {
        source: 'candidate-search'
      }
    });

    return res.status(200).json({
      success: true,
      message: "Candidate saved successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET SAVED CANDIDATES
export const getSavedCandidates = async (req, res) => {
  try {
    const recruiterId = req.id;
    const { page = 1, limit = 20 } = req.query;

    const recruiter = await User.findById(recruiterId)
      .populate({
        path: 'savedCandidates.candidate',
        select: 'fullname email profile profileEnhancements'
      });

    if (!recruiter.savedCandidates) {
      return res.status(200).json({
        success: true,
        candidates: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0
        }
      });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCandidates = recruiter.savedCandidates.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      candidates: paginatedCandidates,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(recruiter.savedCandidates.length / limit),
        totalItems: recruiter.savedCandidates.length
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