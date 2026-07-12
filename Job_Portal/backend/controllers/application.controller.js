import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Interview } from "../models/interview.model.js";
import emailService from "../services/emailService.js";
import notificationHandler from "../websocket/notification-handler.js";

// ✅ APPLY FOR JOB
export const applyJob = async (req, res) => {
  try {
    const userId = req.id; // authenticated user
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required."
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job."
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId).populate('company').populate('created_by');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found."
      });
    }

    // Get candidate details
    const candidate = await User.findById(userId);

    // Create new application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
      status: "pending"
    });

    // Add application to job
    job.applications.push(newApplication._id);
    await job.save();

    // ✅ Send confirmation email to candidate
    if (candidate && candidate.email) {
      await emailService.sendJobApplicationConfirmation(
        candidate.email,
        candidate.fullname,
        job.title,
        job.company.name
      );
    }

    // ✅ Send notification email to employer
    if (job.created_by && job.created_by.email) {
      await emailService.sendNewApplicationNotification(
        job.created_by.email,
        job.created_by.fullname,
        candidate.fullname,
        job.title,
        candidate.email,
        candidate.phoneNumber
      );
    }

    // 🔔 NEW: Send real-time notification to employer
    const socketManager = req.app.get('socketManager');
    if (socketManager && job.created_by) {
      await notificationHandler.sendNotification(
        job.created_by._id,
        {
          type: 'APPLICATION',
          title: 'New Job Application',
          message: `${candidate.fullname} applied for ${job.title}`,
          actionUrl: `/recruiter/applications/${job._id}`,
          relatedId: newApplication._id,
        },
        socketManager
      );
    }

    return res.status(201).json({
      success: true,
      message: "Job application submitted successfully! Confirmation email sent."
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET APPLIED JOBS (For students)
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const applications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'job',
        populate: {
          path: 'company'
        }
      });

    return res.status(200).json({
      success: true,
      applications: applications || []
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET APPLICANTS FOR A JOB (For employers) - Enhanced with skills matching
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { status, sortBy = 'newest' } = req.query;
    
    console.log('🔍 getApplicants called with jobId:', jobId);
    console.log('🔍 Query params:', { status, sortBy });
    
    // First, let's check if the job exists and has applications array
    const jobBasic = await Job.findById(jobId);
    if (!jobBasic) {
      console.log('❌ Job not found for ID:', jobId);
      return res.status(404).json({
        success: false,
        message: 'Job not found.'
      });
    }
    
    console.log('✅ Job found:', jobBasic.title);
    console.log('✅ Job applications array:', jobBasic.applications);
    console.log('✅ Job applications count:', jobBasic.applications ? jobBasic.applications.length : 0);
    
    // Now let's also check applications directly
    const allApplicationsForJob = await Application.find({ job: jobId });
    console.log('🔍 Direct query - Applications for this job:', allApplicationsForJob.length);
    console.log('🔍 Direct query - Applications data:', allApplicationsForJob);
    
    // Build populate options - only filter by status if it's provided
    const populateOptions = {
      path: 'applications',
      options: { sort: { createdAt: sortBy === 'newest' ? -1 : 1 } },
      populate: {
        path: 'applicant',
        select: 'fullname email phoneNumber profile profileEnhancements createdAt'
      }
    };

    // Only add status filter if status is provided
    if (status) {
      populateOptions.match = { status };
    }
    
    const job = await Job.findById(jobId).populate(populateOptions);

    console.log('✅ Final populated applications count:', job.applications ? job.applications.length : 0);

    // Enhanced application data with skills matching
    const enhancedApplications = job.applications.map(application => {
      const applicant = application.applicant;
      
      // Calculate skills match
      const jobRequirements = job.requirements || [];
      const candidateSkills = applicant.profile?.skills || [];
      const enhancedSkills = applicant.profileEnhancements?.workExperience?.flatMap(exp => exp.skills || []) || [];
      const allCandidateSkills = [...candidateSkills, ...enhancedSkills];
      
      const matchingSkills = jobRequirements.filter(req => 
        allCandidateSkills.some(skill => 
          skill.toLowerCase().includes(req.toLowerCase()) ||
          req.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const skillsMatchPercentage = jobRequirements.length > 0 
        ? Math.round((matchingSkills.length / jobRequirements.length) * 100)
        : 0;
      
      // Calculate experience match
      const jobExperienceLevel = job.experienceLevel || '';
      const candidateExperience = applicant.profileEnhancements?.workExperience || [];
      const totalExperienceYears = candidateExperience.reduce((total, exp) => {
        if (exp.startDate && exp.endDate) {
          const start = new Date(exp.startDate);
          const end = exp.currentJob ? new Date() : new Date(exp.endDate);
          const years = (end - start) / (365.25 * 24 * 60 * 60 * 1000);
          return total + years;
        }
        return total;
      }, 0);
      
      let experienceMatch = 'Unknown';
      if (jobExperienceLevel.toLowerCase().includes('entry') && totalExperienceYears <= 2) {
        experienceMatch = 'Perfect Match';
      } else if (jobExperienceLevel.toLowerCase().includes('mid') && totalExperienceYears >= 2 && totalExperienceYears <= 5) {
        experienceMatch = 'Perfect Match';
      } else if (jobExperienceLevel.toLowerCase().includes('senior') && totalExperienceYears >= 5) {
        experienceMatch = 'Perfect Match';
      } else {
        experienceMatch = totalExperienceYears > 0 ? 'Partial Match' : 'No Experience Data';
      }
      
      return {
        ...application.toObject(),
        matching: {
          skillsMatch: {
            percentage: skillsMatchPercentage,
            matchingSkills,
            candidateSkills: allCandidateSkills,
            requiredSkills: jobRequirements
          },
          experienceMatch: {
            level: experienceMatch,
            yearsOfExperience: Math.round(totalExperienceYears * 10) / 10,
            requiredLevel: jobExperienceLevel
          },
          overallScore: Math.round((skillsMatchPercentage + (experienceMatch === 'Perfect Match' ? 100 : experienceMatch === 'Partial Match' ? 50 : 0)) / 2)
        }
      };
    });

    // Sort by overall match score if requested
    if (sortBy === 'match') {
      enhancedApplications.sort((a, b) => b.matching.overallScore - a.matching.overallScore);
    }

    return res.status(200).json({
      success: true,
      job: {
        ...job.toObject(),
        applications: enhancedApplications
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

// ✅ UPDATE APPLICATION STATUS (For employers) - Enhanced with automatic interview scheduling
export const updateStatus = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const { status, message, interviewData } = req.body;

    console.log('📝 updateStatus called with:', { applicationId, status, message, messageLength: message ? message.length : 0 });

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Normalize status to lowercase for comparisons
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'rejected' && !message) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required.'
      });
    }

    const update = { status: normalizedStatus };
    if (normalizedStatus === 'rejected') update.rejectionReason = message;
    else update.rejectionReason = '';

    const application = await Application.findByIdAndUpdate(applicationId, update, { new: true })
      .populate('applicant')
      .populate({
        path: 'job',
        populate: {
          path: 'company'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.'
      });
    }

    let interviewScheduled = false;
    let scheduledInterview = null;

    // 🚀 NEW: Automatic Interview Scheduling when application is accepted
    if (normalizedStatus === 'accepted') {
      try {
        // Default interview data if not provided
        const defaultInterviewData = interviewData || {
          type: 'video',
          title: `Interview for ${application.job.title}`,
          description: `Technical and cultural fit interview for the ${application.job.title} position at ${application.job.company.name}.`,
          duration: 60,
          timeZone: 'UTC',
          preparationInstructions: 'Please prepare to discuss your experience, technical skills, and questions about the role.',
          requiredDocuments: ['Resume/CV', 'Portfolio (if applicable)'],
          technicalRequirements: ['Stable internet connection', 'Camera and microphone', 'Quiet environment']
        };

        // Calculate a default interview date (3-5 business days from now)
        const now = new Date();
        const daysToAdd = Math.floor(Math.random() * 3) + 3; // 3-5 days
        let interviewDate = new Date(now);
        interviewDate.setDate(now.getDate() + daysToAdd);
        
        // Set to 10 AM on the scheduled day
        interviewDate.setHours(10, 0, 0, 0);
        
        // If it's a weekend, move to next Monday
        while (interviewDate.getDay() === 0 || interviewDate.getDay() === 6) {
          interviewDate.setDate(interviewDate.getDate() + 1);
        }

        // Create interview
        const interview = await Interview.create({
          application: application._id,
          job: application.job._id,
          candidate: application.applicant._id,
          recruiter: req.id, // Current user (recruiter)
          company: application.job.company._id,
          type: defaultInterviewData.type,
          title: defaultInterviewData.title,
          description: defaultInterviewData.description,
          scheduledDate: interviewData?.scheduledDate || interviewDate,
          duration: defaultInterviewData.duration,
          timeZone: defaultInterviewData.timeZone,
          meetingLink: interviewData?.meetingLink || null,
          location: interviewData?.location || null,
          preparationInstructions: defaultInterviewData.preparationInstructions,
          requiredDocuments: defaultInterviewData.requiredDocuments,
          technicalRequirements: defaultInterviewData.technicalRequirements,
          status: 'scheduled'
        });

        // Update application status to interview-scheduled
        application.status = 'interview-scheduled';
        await application.save();

        interviewScheduled = true;
        scheduledInterview = interview;

        console.log('✅ Interview automatically scheduled:', interview._id);

        // Send interview notification email
        if (application.applicant.email) {
          await emailService.sendInterviewScheduledEmail(
            application.applicant.email,
            application.applicant.fullname,
            application.job.title,
            interview
          );
        }

      } catch (interviewError) {
        console.error('❌ Failed to schedule automatic interview:', interviewError);
        // Continue with normal acceptance flow even if interview scheduling fails
      }
    }

    // ✅ Send status update email to candidate
    if (application.applicant && application.applicant.email && !interviewScheduled) {
      console.log('📧 Sending email with rejection reason:', { message, status: normalizedStatus });
      await emailService.sendApplicationStatusUpdate(
        application.applicant.email,
        application.applicant.fullname,
        application.job.title,
        normalizedStatus,
        normalizedStatus === 'rejected' ? message : ''
      );
    }

    // 🔔 NEW: Send real-time notification to candidate
    const socketManager = req.app.get('socketManager');
    if (socketManager && application.applicant) {
      let notificationMessage;
      let notificationTitle;
      let actionUrl = `/student/applications`;
      
      if (normalizedStatus === 'accepted' && interviewScheduled) {
        notificationTitle = 'Interview Scheduled!';
        notificationMessage = `Congratulations! Your application for ${application.job.title} has been accepted and an interview has been scheduled for ${scheduledInterview.scheduledDate.toLocaleDateString()}.`;
        actionUrl = `/student/interviews`;
      } else if (normalizedStatus === 'accepted') {
        notificationTitle = 'Application Accepted!';
        notificationMessage = `Congratulations! Your application for ${application.job.title} has been accepted.`;
      } else if (normalizedStatus === 'rejected') {
        notificationTitle = 'Application Update';
        notificationMessage = `Your application for ${application.job.title} has been reviewed.`;
      } else {
        notificationTitle = 'Application Status Update';
        notificationMessage = `Your application for ${application.job.title} status has been updated to ${normalizedStatus}.`;
      }

      await notificationHandler.sendNotification(
        application.applicant._id,
        {
          type: interviewScheduled ? 'INTERVIEW' : 'APPLICATION',
          title: notificationTitle,
          message: notificationMessage,
          actionUrl,
          relatedId: interviewScheduled ? scheduledInterview._id : application._id,
        },
        socketManager
      );
    }

    return res.status(200).json({
      success: true,
      message: interviewScheduled 
        ? "Application accepted and interview automatically scheduled! Candidate has been notified."
        : "Application status updated successfully! Notification sent to candidate.",
      application,
      interview: scheduledInterview,
      interviewScheduled
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
