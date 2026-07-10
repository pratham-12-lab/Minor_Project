import transporter from '../config/emailConfig.js';
import emailTemplates from '../utils/emailTemplates.js';

class EmailService {
  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Job Portal'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email',
      };
    }
  }

  async sendWelcomeEmail(userEmail, userName, userType) {
    const { subject, html } = emailTemplates.welcomeEmail(userName, userType);
    return await this.sendEmail(userEmail, subject, html);
  }

  async sendJobApplicationConfirmation(candidateEmail, candidateName, jobTitle, companyName) {
    const { subject, html } = emailTemplates.jobApplicationConfirmation(
      candidateName,
      jobTitle,
      companyName
    );
    return await this.sendEmail(candidateEmail, subject, html);
  }

  async sendJobOfferEmail(candidateEmail, candidateName, jobTitle, companyName) {
    const { subject, html } = emailTemplates.jobOfferEmail(
      candidateName,
      jobTitle,
      companyName
    );
    return await this.sendEmail(candidateEmail, subject, html);
  }

  async sendInterviewScheduledEmail(candidateEmail, candidateName, jobTitle, interview) {
    const { subject, html } = emailTemplates.interviewScheduledEmail(
      candidateName,
      jobTitle,
      interview
    );
    return await this.sendEmail(candidateEmail, subject, html);
  }

  async sendNewApplicationNotification(
    employerEmail,
    employerName,
    candidateName,
    jobTitle,
    candidateEmail,
    candidatePhone
  ) {
    const { subject, html } = emailTemplates.newApplicationNotification(
      employerName,
      candidateName,
      jobTitle,
      candidateEmail,
      candidatePhone
    );
    return await this.sendEmail(employerEmail, subject, html);
  }

  async sendJobPostedNotification(employerEmail, employerName, jobTitle, jobId) {
    const { subject, html } = emailTemplates.jobPostedSuccess(employerName, jobTitle, jobId);
    return await this.sendEmail(employerEmail, subject, html);
  }

  // ✅ UPDATED: Application status email logic with rejection reason
  async sendApplicationStatusUpdate(candidateEmail, candidateName, jobTitle, status, reason = '') {
    console.log('📧 sendApplicationStatusUpdate called with:', { candidateEmail, candidateName, jobTitle, status, reason, reasonLength: reason ? reason.length : 0 });
    const { subject, html } = emailTemplates.applicationStatusUpdate(candidateName, jobTitle, status, reason);
    
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'Job Portal'}" <${process.env.SMTP_USER}>`,
        to: candidateEmail,
        subject,
        html,
      });
      console.log('✅ Status email sent:', info.messageId);
    } catch (error) {
      console.error('❌ Failed to send status email:', error.message);
    }
  }

  async sendBulkEmails(recipients, subject, html) {
    const results = [];
    for (const recipient of recipients) {
      const result = await this.sendEmail(recipient, subject, html);
      results.push({ email: recipient, ...result });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // rate limit
    }
    return results;
  }

  // ✅ Send employer approval/rejection email
  async sendEmployerApprovalEmail(email, name, status, reason = '') {
    try {
      const subject =
        status === 'approved'
          ? '✅ Your Employer Account Has Been Approved!'
          : '❌ Employer Account Application Update';

      const html = status === 'approved'
        ? `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
              .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-badge { background: #d1fae5; color: #065f46; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">🎉 Congratulations!</h1>
              <p style="margin: 10px 0 0 0;">Your employer account has been approved</p>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <div class="success-badge">✅ Account Approved</div>
              <p>Great news! Your employer account has been successfully approved by our admin team. You can now access all employer features including:</p>
              <ul style="padding-left: 20px; margin: 20px 0;">
                <li>✅ Post unlimited job listings</li>
                <li>✅ Browse and search candidate profiles</li>
                <li>✅ Manage applications and communicate with candidates</li>
                <li>✅ Access advanced recruitment tools</li>
                <li>✅ View analytics and insights</li>
              </ul>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Login to Your Account</a>
              </div>
              <p>Thank you for choosing our platform to find the best talent for your organization!</p>
              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ${process.env.APP_NAME || 'Job Portal'}. All rights reserved.</p>
            </div>
          </body>
          </html>
        `
        : `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
              .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .rejection-badge { background: #fee2e2; color: #991b1b; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .button { display: inline-block; padding: 15px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">Account Application Update</h1>
              <p style="margin: 10px 0 0 0;">Regarding your employer account application</p>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <div class="rejection-badge">❌ Application Not Approved</div>
              <p>Thank you for your interest in becoming an employer on our platform. After reviewing your application, we are unable to approve your account at this time.</p>
              ${reason ? `
                <div class="reason-box">
                  <h4 style="margin-top: 0; color: #991b1b;">Reason for rejection:</h4>
                  <p style="margin-bottom: 0;">${reason}</p>
                </div>
              ` : ''}
              <p>We encourage you to:</p>
              <ul style="padding-left: 20px; margin: 20px 0;">
                <li>Review our employer guidelines and requirements</li>
                <li>Ensure all information provided is accurate and complete</li>
                <li>Contact our support team if you have questions</li>
                <li>Consider reapplying in the future with updated information</li>
              </ul>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/contact" class="button">Contact Support</a>
              </div>
              <p>Thank you for your understanding.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ${process.env.APP_NAME || 'Job Portal'}. All rights reserved.</p>
            </div>
          </body>
          </html>
        `;

      const result = await this.sendEmail(email, subject, html);
      
      if (result.success) {
        console.log(`✅ Employer ${status} email sent to ${email}`);
      } else {
        console.log(`❌ Failed to send employer ${status} email to ${email}:`, result.error);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Error in sendEmployerApprovalEmail:`, error);
      throw error; // Re-throw the error so the controller can handle it
    }
  }

  // ✅ Job alert email (unchanged)
  async sendJobAlertEmail(email, name, job) {
    const subject = `🚨 New Job Alert: ${job.title}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .job-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .job-title { color: #667eea; font-size: 24px; margin-bottom: 10px; }
          .company-name { color: #666; font-size: 18px; margin-bottom: 15px; }
          .detail-row { display: flex; margin: 10px 0; }
          .detail-label { font-weight: bold; width: 120px; color: #555; }
          .detail-value { color: #333; }
          .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎯 New Job Alert!</h1>
            <p style="margin: 10px 0 0 0;">A new job matching your criteria has been posted</p>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! A new job that matches your alert preferences has been posted:</p>
            <div class="job-card">
              <h2 class="job-title">${job.title}</h2>
              <p class="company-name">${job.company?.name || 'Company Name'}</p>
              <div class="detail-row"><span class="detail-label">📍 Location:</span><span class="detail-value">${job.location}</span></div>
              <div class="detail-row"><span class="detail-label">💼 Job Type:</span><span class="detail-value">${job.jobType}</span></div>
              <div class="detail-row"><span class="detail-label">💰 Salary:</span><span class="detail-value">${job.salary} LPA</span></div>
              <div class="detail-row"><span class="detail-label">📊 Experience:</span><span class="detail-value">${job.experienceLevel} years</span></div>
              <div class="detail-row"><span class="detail-label">👥 Positions:</span><span class="detail-value">${job.position}</span></div>
              <p style="margin-top: 15px;"><strong>Description:</strong></p>
              <p>${job.description}</p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/description/${job._id}" class="button">View Job Details & Apply</a>
              </div>
            </div>
            <p>Don't miss out on this opportunity!</p>
            <p><small>You're receiving this email because you set up a job alert matching these criteria.</small></p>
          </div>
          <div class="footer">
            <p>Manage your job alerts in your <a href="${process.env.FRONTEND_URL}/job-alerts">account settings</a></p>
            <p>&copy; 2025 ${process.env.APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html
    });
  }
}

const emailServiceInstance = new EmailService();
export default emailServiceInstance;
