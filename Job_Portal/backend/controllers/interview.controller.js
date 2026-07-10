import { Interview } from "../models/interview.model.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import emailService from "../services/emailService.js";
import notificationHandler from "../websocket/notification-handler.js";

// ✅ SCHEDULE INTERVIEW
export const scheduleInterview = async (req, res) => {
  try {
    const recruiterId = req.id;
    const { applicationId } = req.params;
    const {
      type,
      title,
      description,
      scheduledDate,
      duration,
      timeZone,
      meetingLink,
      location,
      interviewers,
      preparationInstructions,
      requiredDocuments,
      technicalRequirements
    } = req.body;

    // Validate application exists
    const application = await Application.findById(applicationId)
      .populate('job')
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
        message: "Application not found."
      });
    }

    // Check if recruiter owns this job
    if (application.job.created_by.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to schedule interview for this application."
      });
    }

    // Create interview
    const interview = await Interview.create({
      application: applicationId,
      job: application.job._id,
      candidate: application.applicant._id,
      recruiter: recruiterId,
      company: application.job.company._id,
      type,
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      timeZone: timeZone || 'UTC',
      meetingLink,
      location,
      interviewers: interviewers || [],
      preparationInstructions,
      requiredDocuments: requiredDocuments || [],
      technicalRequirements: technicalRequirements || []
    });

    // Update application status
    application.status = 'interview-scheduled';
    await application.save();

    // Send notifications
    const socketManager = req.app.get('socketManager');
    
    // Notify candidate
    if (socketManager) {
      await notificationHandler.sendNotification(
        application.applicant._id,
        {
          type: 'INTERVIEW',
          title: 'Interview Scheduled!',
          message: `Interview scheduled for ${application.job.title} on ${new Date(scheduledDate).toLocaleDateString()}`,
          actionUrl: `/student/interviews/${interview._id}`,
          relatedId: interview._id,
        },
        socketManager
      );
    }

    // Send confirmation email
    if (application.applicant.email) {
      await emailService.sendInterviewScheduledEmail(
        application.applicant.email,
        application.applicant.fullname,
        application.job.title,
        interview
      );
    }

    const populatedInterview = await Interview.findById(interview._id)
      .populate('candidate', 'fullname email')
      .populate('job', 'title')
      .populate('company', 'name');

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully!",
      interview: populatedInterview
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET INTERVIEWS FOR RECRUITER
export const getRecruiterInterviews = async (req, res) => {
  try {
    const recruiterId = req.id;
    const { status, upcoming, page = 1, limit = 10 } = req.query;

    let query = { recruiter: recruiterId };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
    }

    const interviews = await Interview.find(query)
      .populate('candidate', 'fullname email profile.profilePhoto')
      .populate('job', 'title')
      .populate('company', 'name logo')
      .sort({ scheduledDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalInterviews = await Interview.countDocuments(query);

    return res.status(200).json({
      success: true,
      interviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalInterviews / limit),
        totalItems: totalInterviews
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

// ✅ GET INTERVIEWS FOR CANDIDATE
export const getCandidateInterviews = async (req, res) => {
  try {
    const candidateId = req.id;
    const { status, upcoming, page = 1, limit = 10 } = req.query;

    let query = { candidate: candidateId };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
    }

    const interviews = await Interview.find(query)
      .populate('recruiter', 'fullname email')
      .populate('job', 'title location')
      .populate('company', 'name logo website')
      .sort({ scheduledDate: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalInterviews = await Interview.countDocuments(query);

    return res.status(200).json({
      success: true,
      interviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalInterviews / limit),
        totalItems: totalInterviews
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

// ✅ CONFIRM INTERVIEW (by candidate)
export const confirmInterview = async (req, res) => {
  try {
    const candidateId = req.id;
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found."
      });
    }

    if (interview.candidate.toString() !== candidateId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized."
      });
    }

    interview.candidateConfirmed = true;
    interview.candidateConfirmedAt = new Date();
    interview.status = 'confirmed';
    await interview.save();

    // Notify recruiter
    const socketManager = req.app.get('socketManager');
    if (socketManager) {
      await notificationHandler.sendNotification(
        interview.recruiter,
        {
          type: 'INTERVIEW',
          title: 'Interview Confirmed',
          message: `Candidate confirmed the interview scheduled for ${interview.scheduledDate.toLocaleDateString()}`,
          actionUrl: `/recruiter/interviews/${interview._id}`,
          relatedId: interview._id,
        },
        socketManager
      );
    }

    return res.status(200).json({
      success: true,
      message: "Interview confirmed successfully!",
      interview
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ SUBMIT INTERVIEW FEEDBACK - Enhanced with automatic final selection
export const submitInterviewFeedback = async (req, res) => {
  try {
    const recruiterId = req.id;
    const { interviewId } = req.params;
    const { feedback } = req.body;

    // Validate feedback data
    if (!feedback) {
      return res.status(400).json({
        success: false,
        message: "Feedback is required."
      });
    }

    const interview = await Interview.findById(interviewId)
      .populate('candidate', 'fullname email')
      .populate('job', 'title')
      .populate('company', 'name');
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found."
      });
    }

    if (interview.recruiter.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized."
      });
    }

    // Update interview with feedback
    interview.feedback = feedback;
    interview.status = 'completed';
    await interview.save();

    // 🚀 Enhanced: Automatic final selection based on interview feedback
    let finalDecision = null;
    
    try {
      if (feedback.overall && feedback.overall.recommendation) {
        const application = await Application.findById(interview.application);
        
        if (!application) {
          console.log('Application not found for interview:', interview._id);
          return res.status(200).json({
            success: true,
            message: "Interview feedback submitted successfully!",
            interview,
            warning: "Could not update application status - application not found."
          });
        }
        
        if (feedback.overall.recommendation === 'hire') {
          // 🎉 CANDIDATE SELECTED FOR THE POSITION
          application.status = 'selected'; // New status for final selection
          application.selectionDate = new Date();
          application.interviewFeedback = feedback;
          
          finalDecision = 'selected';
          
          // Send selection confirmation email
          if (interview.candidate && interview.candidate.email) {
            try {
              await emailService.sendJobOfferEmail(
                interview.candidate.email,
                interview.candidate.fullname,
                interview.job.title,
                interview.company.name
              );
            } catch (emailError) {
              console.log('Error sending job offer email:', emailError);
            }
          }
          
        } else if (feedback.overall.recommendation === 'no-hire') {
          // ❌ CANDIDATE NOT SELECTED
          application.status = 'rejected';
          application.rejectionReason = 'Did not meet interview requirements';
          application.interviewFeedback = feedback;
          
          finalDecision = 'rejected';
          
          // Send rejection email
          if (interview.candidate && interview.candidate.email) {
            try {
              await emailService.sendApplicationStatusUpdate(
                interview.candidate.email,
                interview.candidate.fullname,
                interview.job.title,
                'rejected',
                'Thank you for your time in the interview process. We have decided to move forward with other candidates at this time.'
              );
            } catch (emailError) {
              console.log('Error sending rejection email:', emailError);
            }
          }
          
        } else if (feedback.overall.recommendation === 'maybe') {
          // 🤔 UNDER CONSIDERATION - Keep as interview-completed for further review
          application.status = 'under-review';
          application.interviewFeedback = feedback;
          
          finalDecision = 'under-review';
        }
        
        await application.save();

        // 🔔 Send real-time notification to candidate about final decision
        const socketManager = req.app.get('socketManager');
        if (socketManager && interview.candidate) {
          let notificationTitle, notificationMessage, actionUrl;
          
          if (finalDecision === 'selected') {
            notificationTitle = 'Congratulations! You\'ve been selected!';
            notificationMessage = `🎉 Great news! You have been selected for the ${interview.job.title} position at ${interview.company.name}. Check your email for next steps.`;
            actionUrl = `/student/applications`;
          } else if (finalDecision === 'rejected') {
            notificationTitle = 'Interview Results';
            notificationMessage = `Thank you for interviewing for ${interview.job.title}. We have decided to move forward with other candidates.`;
            actionUrl = `/student/interviews`;
          } else if (finalDecision === 'under-review') {
            notificationTitle = 'Interview Completed';
            notificationMessage = `Your interview for ${interview.job.title} has been completed. We are reviewing all candidates and will get back to you soon.`;
            actionUrl = `/student/interviews`;
          }
          
          try {
            const candidateId = interview.candidate._id || interview.candidate;
            await notificationHandler.sendNotification(
              candidateId,
              {
                type: finalDecision === 'selected' ? 'JOB_OFFER' : 'INTERVIEW',
                title: notificationTitle,
                message: notificationMessage,
                actionUrl,
                relatedId: finalDecision === 'selected' ? application._id : interview._id,
              },
              socketManager
            );
          } catch (notificationError) {
            console.log('Error sending notification:', notificationError);
          }
        }
      }
    } catch (applicationUpdateError) {
      console.log('Error updating application status:', applicationUpdateError);
      // Don't fail the entire request if application update fails
    }

    return res.status(200).json({
      success: true,
      message: finalDecision === 'selected' 
        ? "Interview feedback submitted and candidate selected for the position! Job offer sent."
        : finalDecision === 'rejected'
        ? "Interview feedback submitted and application status updated to rejected."
        : "Interview feedback submitted successfully!",
      interview,
      finalDecision
    });

  } catch (error) {
    console.log('Error in submitInterviewFeedback:', error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while submitting feedback. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✅ RESCHEDULE INTERVIEW
export const rescheduleInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { newDate, reason } = req.body;
    const userId = req.id;

    const interview = await Interview.findById(interviewId)
      .populate('candidate', 'fullname email')
      .populate('recruiter', 'fullname email')
      .populate('job', 'title');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found."
      });
    }

    // Check if user is authorized (either candidate or recruiter)
    const isAuthorized = interview.candidate._id.toString() === userId || 
                        interview.recruiter._id.toString() === userId;
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized."
      });
    }

    const oldDate = interview.scheduledDate;
    
    interview.rescheduledFrom = oldDate;
    interview.rescheduledReason = reason;
    interview.rescheduledBy = userId;
    interview.scheduledDate = new Date(newDate);
    interview.status = 'rescheduled';
    interview.candidateConfirmed = false;
    
    await interview.save();

    // Notify the other party
    const socketManager = req.app.get('socketManager');
    if (socketManager) {
      const notifyUserId = interview.candidate._id.toString() === userId 
        ? interview.recruiter._id 
        : interview.candidate._id;
      
      await notificationHandler.sendNotification(
        notifyUserId,
        {
          type: 'INTERVIEW',
          title: 'Interview Rescheduled',
          message: `Interview for ${interview.job.title} has been rescheduled to ${new Date(newDate).toLocaleDateString()}`,
          actionUrl: `/interviews/${interview._id}`,
          relatedId: interview._id,
        },
        socketManager
      );
    }

    return res.status(200).json({
      success: true,
      message: "Interview rescheduled successfully!",
      interview
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ CANCEL INTERVIEW
export const cancelInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { reason } = req.body;
    const userId = req.id;

    const interview = await Interview.findById(interviewId)
      .populate('candidate', 'fullname email')
      .populate('recruiter', 'fullname email')
      .populate('job', 'title');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found."
      });
    }

    // Check authorization
    const isAuthorized = interview.candidate._id.toString() === userId || 
                        interview.recruiter._id.toString() === userId;
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized."
      });
    }

    interview.status = 'cancelled';
    interview.cancellationReason = reason;
    interview.cancelledBy = userId;
    interview.cancelledAt = new Date();
    
    await interview.save();

    // Notify the other party
    const socketManager = req.app.get('socketManager');
    if (socketManager) {
      const notifyUserId = interview.candidate._id.toString() === userId 
        ? interview.recruiter._id 
        : interview.candidate._id;
      
      await notificationHandler.sendNotification(
        notifyUserId,
        {
          type: 'INTERVIEW',
          title: 'Interview Cancelled',
          message: `Interview for ${interview.job.title} has been cancelled. Reason: ${reason}`,
          actionUrl: `/interviews/${interview._id}`,
          relatedId: interview._id,
        },
        socketManager
      );
    }

    return res.status(200).json({
      success: true,
      message: "Interview cancelled successfully!",
      interview
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};