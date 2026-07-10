import dotenv from 'dotenv';
dotenv.config();

const emailTemplates = {
  // Welcome email for new users
  welcomeEmail: (userName, userType) => ({
    subject: `Welcome to ${process.env.APP_NAME || 'Job Portal'}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; color: #333333; line-height: 1.6; }
          .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Job Portal!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}! 👋</h2>
            <p>Welcome to <strong>${process.env.APP_NAME || 'Job Portal'}</strong>! We're excited to have you on board as a <strong>${userType}</strong>.</p>
            
            ${userType === 'jobseeker' ? `
              <p>Here's what you can do:</p>
              <ul>
                <li>Browse thousands of job opportunities</li>
                <li>Apply to jobs with one click</li>
                <li>Track your application status</li>
                <li>Get personalized job recommendations</li>
              </ul>
            ` : `
              <p>Here's what you can do:</p>
              <ul>
                <li>Post unlimited job listings</li>
                <li>Manage applications efficiently</li>
                <li>Find the best candidates</li>
                <li>Build your employer brand</li>
              </ul>
            `}
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Get Started Now</a>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br><strong>The Job Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Job application confirmation for candidate
  jobApplicationConfirmation: (candidateName, jobTitle, companyName) => ({
    subject: `Application Received: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; color: #333333; line-height: 1.6; }
          .job-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Application Submitted!</h1>
          </div>
          <div class="content">
            <h2>Dear ${candidateName},</h2>
            <p>Thank you for applying to our job opening! Your application has been successfully received.</p>
            
            <div class="job-details">
              <h3>📋 Application Details</h3>
              <p><strong>Position:</strong> ${jobTitle}</p>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Applied on:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>The hiring team will review your application</li>
              <li>You'll be notified of any status updates</li>
              <li>Keep an eye on your email for further communication</li>
            </ul>
            
            <p>You can track your application status anytime by logging into your dashboard.</p>
            
            <p>Good luck! 🤞</p>
            <p>Best regards,<br><strong>${companyName} Hiring Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Notification to employer about new application
  newApplicationNotification: (employerName, candidateName, jobTitle, candidateEmail, candidatePhone) => ({
    subject: `New Application: ${candidateName} applied for ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; color: #333333; line-height: 1.6; }
          .candidate-info { background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Job Application!</h1>
          </div>
          <div class="content">
            <h2>Hello ${employerName},</h2>
            <p>Great news! You have received a new application for your job posting.</p>
            
            <div class="candidate-info">
              <h3>👤 Candidate Information</h3>
              <p><strong>Name:</strong> ${candidateName}</p>
              <p><strong>Email:</strong> ${candidateEmail}</p>
              <p><strong>Phone:</strong> ${candidatePhone || 'Not provided'}</p>
              <p><strong>Position Applied:</strong> ${jobTitle}</p>
              <p><strong>Applied on:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <p>Log in to your employer dashboard to:</p>
            <ul>
              <li>View the complete application</li>
              <li>Download the candidate's resume</li>
              <li>Update application status</li>
              <li>Schedule interviews</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/employer/applications" class="button">View Application</a>
            </div>
            
            <p>Best regards,<br><strong>Job Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Job posting success notification
  jobPostedSuccess: (employerName, jobTitle, jobId) => ({
    subject: `Job Posted Successfully: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; color: #333333; line-height: 1.6; }
          .success-box { background-color: #d4edda; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Job Posted Successfully!</h1>
          </div>
          <div class="content">
            <h2>Dear ${employerName},</h2>
            
            <div class="success-box">
              <h3>✅ Your job posting is now live!</h3>
              <p><strong>Job Title:</strong> ${jobTitle}</p>
              <p><strong>Posted on:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Job ID:</strong> #${jobId}</p>
            </div>
            
            <p>Your job posting is now visible to thousands of job seekers on our platform.</p>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Monitor applications in your dashboard</li>
              <li>Receive email notifications for new applications</li>
              <li>Review and shortlist candidates</li>
              <li>Update job status anytime</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/employer/jobs" class="button">Manage Jobs</a>
            </div>
            
            <p>Thank you for choosing our platform!</p>
            <p>Best regards,<br><strong>Job Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Interview scheduled email
  interviewScheduledEmail: (candidateName, jobTitle, interview) => ({
    subject: `📅 Interview Scheduled: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; color: #333333; line-height: 1.6; }
          .interview-details { background-color: #e3f2fd; padding: 25px; border-left: 4px solid #2196f3; margin: 25px 0; border-radius: 8px; }
          .preparation { background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .important-note { background-color: #fce4ec; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e91e63; }
          .button { display: inline-block; padding: 15px 35px; background-color: #2196f3; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Interview Scheduled!</h1>
            <h2>Get Ready to Shine!</h2>
          </div>
          <div class="content">
            <h2>Dear ${candidateName},</h2>
            <p>Great news! Your interview has been scheduled for the <strong>${jobTitle}</strong> position. We're looking forward to meeting with you!</p>
            
            <div class="interview-details">
              <h3>📋 Interview Details</h3>
              <p><strong>📅 Date & Time:</strong> ${new Date(interview.scheduledDate).toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>⏱️ Duration:</strong> ${interview.duration} minutes</p>
              <p><strong>🎥 Type:</strong> ${interview.type === 'video' ? '🎥 Video Call' : interview.type === 'phone' ? '📞 Phone Call' : '🏢 In-Person'}</p>
              ${interview.meetingLink ? `<p><strong>🔗 Meeting Link:</strong> <a href="${interview.meetingLink}" style="color: #2196f3;">${interview.meetingLink}</a></p>` : ''}
              ${interview.location ? `<p><strong>📍 Location:</strong> ${interview.location}</p>` : ''}
              <p><strong>🏢 Company:</strong> ${interview.company || 'Company Name'}</p>
            </div>
            
            ${interview.preparationInstructions ? `
              <div class="preparation">
                <h3>📚 Interview Preparation</h3>
                <p>${interview.preparationInstructions}</p>
              </div>
            ` : ''}
            
            ${interview.requiredDocuments && interview.requiredDocuments.length > 0 ? `
              <div class="important-note">
                <h3>📄 Required Documents</h3>
                <p>Please bring the following documents:</p>
                <ul>
                  ${interview.requiredDocuments.map(doc => `<li>${doc}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${interview.technicalRequirements && interview.technicalRequirements.length > 0 ? `
              <div class="preparation">
                <h3>💻 Technical Requirements</h3>
                <ul>
                  ${interview.technicalRequirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            <div class="important-note">
              <h3>⚠️ Important Reminders</h3>
              <ul>
                <li>✅ Please confirm your attendance by replying to this email</li>
                <li>⏰ Join the meeting 5-10 minutes early</li>
                <li>📞 Contact us immediately if you need to reschedule</li>
                <li>💼 Come prepared with questions about the role and company</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/interviews" class="button">View Interview Details</a>
            </div>
            
            <p>We're excited to learn more about you and discuss how you can contribute to our team!</p>
            
            <p>Best of luck with your preparation!</p>
            
            <p>Best regards,<br><strong>Hiring Team</strong></p>
          </div>
          <div class="footer">
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>&copy; 2025 Job Portal. Your career success partner.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Job offer email
  jobOfferEmail: (candidateName, jobTitle, companyName) => ({
    subject: `🎉 Job Offer: ${jobTitle} at ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 40px; text-align: center; }
          .content { padding: 30px; color: #333333; line-height: 1.6; }
          .offer-details { background-color: #d4edda; padding: 25px; border-left: 4px solid #28a745; margin: 25px 0; border-radius: 8px; }
          .celebration { background: linear-gradient(135deg, #ffeaa7, #fdcb6e); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .next-steps { background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 15px 35px; background-color: #28a745; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <h2>You've Got the Job!</h2>
          </div>
          <div class="content">
            <div class="celebration">
              <h2>🎊 Welcome to the Team! 🎊</h2>
            </div>
            
            <h2>Dear ${candidateName},</h2>
            <p>We are thrilled to extend this job offer to you! After careful consideration of your qualifications, experience, and interview performance, we are confident that you will be a valuable addition to our team.</p>
            
            <div class="offer-details">
              <h3>🏢 Job Offer Details</h3>
              <p><strong>Position:</strong> ${jobTitle}</p>
              <p><strong>Company:</strong> ${companyName}</p>
              <p><strong>Interview Status:</strong> ✅ Successfully Completed</p>
              <p><strong>Decision:</strong> <span style="color: #28a745; font-weight: bold;">SELECTED</span></p>
            </div>
            
            <div class="next-steps">
              <h3>📋 Next Steps</h3>
              <p>Our HR team will contact you within <strong>24-48 hours</strong> with:</p>
              <ul>
                <li>📄 Formal offer letter with complete terms</li>
                <li>💰 Detailed compensation package</li>
                <li>📅 Proposed start date</li>
                <li>📋 Onboarding documentation</li>
                <li>🏢 Office location and reporting details</li>
              </ul>
            </div>
            
            <p><strong>What impressed us about you:</strong></p>
            <ul>
              <li>✨ Exceptional technical skills and problem-solving abilities</li>
              <li>💪 Strong communication and teamwork capabilities</li>
              <li>🎯 Perfect cultural fit with our company values</li>
              <li>🚀 Enthusiasm and passion for the role</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/applications" class="button">View Application Status</a>
            </div>
            
            <p>We're excited to have you join us and look forward to working together!</p>
            
            <p>If you have any questions, please don't hesitate to reach out.</p>
            
            <p>Warm regards,<br><strong>${companyName} Hiring Team</strong></p>
            
            <div class="celebration">
              <p style="font-size: 18px; margin: 0;">🌟 Welcome to your new career journey! 🌟</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 Job Portal. Your career success partner.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  // Application status update
  // Application status update
  applicationStatusUpdate: (candidateName, jobTitle, status, message = '') => {
    // Log for debugging
    console.log('📧 Email Template Called:', { candidateName, jobTitle, status, message, messageLength: message ? message.length : 0 });
    
    const getHeaderColor = () => {
      if (status === 'rejected') return '#f5576c 0%, #fa709a';
      if (status === 'accepted') return '#11998e 0%, #38ef7d';
      return '#fa709a 0%, #fee140';
    };
    
    const getHeaderTitle = () => {
      if (status === 'rejected') return '❌ Application Status Update';
      if (status === 'accepted') return '🎉 Congratulations!';
      return '📬 Application Status Update';
    };
    
    const getStatusMessage = () => {
      if (status === 'rejected') 
        return `<p>We regret to inform you that your application for the position of <strong>${jobTitle}</strong> has been <strong>rejected</strong>.</p>`;
      if (status === 'accepted')
        return `<p>Congratulations! We are pleased to inform you that your application for the position of <strong>${jobTitle}</strong> has been <strong>accepted</strong>!</p>`;
      return `<p>We have an update regarding your application for <strong>${jobTitle}</strong>.</p>`;
    };
    
    const getFeedbackSection = () => {
      console.log('🔍 Checking feedback:', { status, message, hasMessage: !!message });
      if (status === 'rejected' && message && message.trim()) {
        return `
          <div class="rejection-reason">
            <strong>📋 Feedback from Company:</strong>
            <p>${message}</p>
          </div>
        `;
      }
      if (message && message.trim()) {
        return `<p><strong>Message from employer:</strong><br>${message}</p>`;
      }
      return '';
    };
    
    const getAcceptanceMessage = () => {
      return status === 'accepted' ? '<p>Our team will reach out to you with further details soon.</p>' : '';
    };

    const feedbackHtml = getFeedbackSection();
    
    return {
      subject: status === 'rejected' ? `Application Rejected: ${jobTitle}` : `Application Update: ${jobTitle}`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, ${getHeaderColor()}); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; color: #333333; line-height: 1.6; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .status-accepted { background-color: #d4edda; color: #155724; }
          .status-rejected { background-color: #f8d7da; color: #721c24; }
          .status-reviewing { background-color: #d1ecf1; color: #0c5460; }
          .status-shortlisted { background-color: #fff3cd; color: #856404; }
          .rejection-reason { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 5px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${getHeaderTitle()}</h1>
          </div>
          <div class="content">
            <h2>Dear ${candidateName},</h2>
            
            ${getStatusMessage()}
            
            <p>
              <strong>Current Status:</strong> 
              <span class="status-badge status-${status.toLowerCase()}">${status.toUpperCase()}</span>
            </p>
            
            ${feedbackHtml}
            
            ${getAcceptanceMessage()}
            
            <p>You can view more details by logging into your dashboard.</p>
            
            <p>Best regards,<br><strong>Job Portal Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
    };
  },
};

export default emailTemplates;
