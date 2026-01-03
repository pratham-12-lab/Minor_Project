📝 Project Overview
The Smart Job Portal is designed to solve the friction found in legacy recruitment systems. It provides a structured, role-based environment where Job Seekers can manage their career trajectories through an intelligent Resume Builder and AI Chatbot, while Employers gain access to an Analytical Dashboard that objectively ranks applicants based on skill-match logic.

By utilizing Cloudinary for high-performance asset management and Tailwind CSS for a responsive, modern UI, the platform ensures a seamless experience across all devices.

✨ Key Features
👤 For Job Seekers
Structured Resume Builder: Move beyond flat PDF files. Input detailed skills, experience, and education to build a data-driven profile.

AI-Powered Career Assistant: An integrated chatbot that assists with profile creation, answers platform FAQs, and provides real-time guidance.

Advanced Job Discovery: Filter opportunities by industry, location, and salary, or let the Recommendation Engine suggest roles based on your specific skill set.

Real-time Status Tracking: Receive instant SMTP email notifications via Nodemailer when your application status changes (Accepted/Rejected).

🏢 For Employers
Applicant Management Hub: A centralized dashboard to view, shortlist, and manage candidates with one-click Accept/Reject functionality.

Analytical Suitability Dashboard: View objective "Fit Scores" for every applicant. The system automatically compares candidate skills against job requirements to highlight the best talent.

Secure Cloud Management: Resumes and profile photos are securely stored and served via Cloudinary integration.

Seamless Job Posting: Tools to create, edit, and manage job listings with structured requirement fields.

🛡️ For Administrators
Admin Dashboard: High-level oversight to manage recruiter accounts, verify employers, and maintain platform integrity.

🛠️ Tech Stack
Frontend: React.js, Tailwind CSS, Lucide React (Icons).

Backend: Node.js, Express.js.

Database: MongoDB (using Mongoose ODM).

File Storage: Cloudinary (Resumes & Images).

Authentication: JSON Web Tokens (JWT) & Role-Based Access Control (RBAC).

Communication: Nodemailer (SMTP Service).



To start the Frontend:
In the terminal, run:

npm run dev


To start the Backend:
In the terminal, run:

nodemon index.js
