import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import emailService from "../services/emailService.js";
import { sendJobAlertEmail } from "./jobAlert.controller.js";
import notificationHandler from "../websocket/notification-handler.js";

// ✅ CREATE JOB (ADMIN / EMPLOYER) with job alerts
export const postJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      requirements, 
      salary, 
      location, 
      jobType, 
      experience, 
      position, 
      companyId 
    } = req.body;
    const userId = req.id; // authenticated user

    console.log('📝 Job creation attempt:', {
      userId,
      title,
      companyId,
      experience,
      requiredFields: {
        title: !!title,
        description: !!description,
        requirements: !!requirements,
        salary: !!salary,
        location: !!location,
        jobType: !!jobType,
        experience: !!experience,
        position: !!position,
        companyId: !!companyId
      }
    });

    // Validate required fields
    if (!title || !description || !requirements || !salary || !location || 
        !jobType || !experience || !position || !companyId) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({
        message: "All fields are required.",
        success: false,
        missingFields: {
          title: !title,
          description: !description,
          requirements: !requirements,
          salary: !salary,
          location: !location,
          jobType: !jobType,
          experience: !experience,
          position: !position,
          companyId: !companyId
        }
      });
    }

    // Validate experience level
    const validExperienceLevels = ['Entry-level', 'Mid-level', 'Senior', 'Executive'];
    if (!validExperienceLevels.includes(experience)) {
      console.log('❌ Invalid experience level:', experience);
      return res.status(400).json({
        message: `Invalid experience level. Must be one of: ${validExperienceLevels.join(', ')}`,
        success: false
      });
    }

    // Validate and convert numeric fields
    const salaryNum = Number(salary);
    const positionNum = Number(position);
    
    if (isNaN(salaryNum) || salaryNum <= 0) {
      console.log('❌ Invalid salary:', salary);
      return res.status(400).json({
        message: "Salary must be a positive number",
        success: false
      });
    }
    
    if (isNaN(positionNum) || positionNum <= 0) {
      console.log('❌ Invalid position count:', position);
      return res.status(400).json({
        message: "Position count must be a positive number",
        success: false
      });
    }

    console.log('✅ Creating job with data:', {
      title,
      description: description.substring(0, 100) + '...',
      requirements: Array.isArray(requirements) ? requirements : requirements.split(",").map(req => req.trim()),
      salary: salaryNum,
      location,
      jobType,
      experienceLevel: experience,
      position: positionNum,
      company: companyId,
      created_by: userId
    });

    // Create job
    const job = await Job.create({
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements.split(",").map(req => req.trim()),
      salary: salaryNum,
      location,
      jobType,
      experienceLevel: experience,
      position: positionNum,
      company: companyId,
      created_by: userId
    });

    console.log('✅ Job created successfully:', job._id);

    // Populate company details
    await job.populate("company");

    // ✅ Send job alerts to matching users (async, don't wait)
    sendJobAlertEmail(job).catch(err => 
      console.error('Job alert email error:', err)
    );

    // ✅ Send confirmation email to employer
    const employer = await User.findById(userId);
    if (employer?.email) {
      emailService.sendJobPostedNotification(
        employer.email,
        employer.fullname,
        title,
        job._id
      ).catch(err => 
        console.error('Employer notification error:', err)
      );
    }

    // 🔔 NEW: Send real-time notifications to relevant candidates
    const socketManager = req.app.get('socketManager');
    if (socketManager) {
      // Find candidates who might be interested (basic matching by experience level)
      const potentialCandidates = await User.find({
        role: 'student', // assuming students are job seekers
        // You can add more sophisticated matching logic here
      }).limit(50); // Limit to avoid overwhelming

      // Send notifications to matching candidates
      for (const candidate of potentialCandidates) {
        try {
          await notificationHandler.sendNotification(
            candidate._id,
            {
              type: 'JOB',
              title: 'New Job Available',
              message: `New ${experience} position: ${title} at ${job.company.name}`,
              actionUrl: `/jobs/${job._id}`,
              relatedId: job._id,
            },
            socketManager
          );
        } catch (error) {
          console.error(`Failed to send notification to candidate ${candidate._id}:`, error);
        }
      }
    }

    return res.status(201).json({
      message: "New job created successfully.",
      job,
      success: true
    });
  } catch (error) {
    console.error('Post job error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message
    });
  }
};

// ✅ GET ALL JOBS (For students) - Basic search
export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    
    const query = keyword ? {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } }
      ]
    } : {};

    const jobs = await Job.find(query)
      .populate("company")
      .sort({ createdAt: -1 });

    // ✅ Return empty array instead of 404 when no jobs found
    return res.status(200).json({
      success: true,
      jobs: jobs || [],
      count: jobs ? jobs.length : 0,
      message: jobs && jobs.length > 0 ? "Jobs retrieved successfully" : "No jobs found"
    });

  } catch (error) {
    console.error('Get all jobs error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message
    });
  }
};

// ✅ ADVANCED FILTERED JOB SEARCH (with pagination)
export const getFilteredJobs = async (req, res) => {
  try {
    const { 
      keyword, 
      company, 
      location, 
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills, 
      dateFrom, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // ✅ Keyword search (title, description)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    // ✅ Location filter
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // ✅ Job type filter (Full-time, Part-time, etc)
    if (jobType) {
      query.jobType = jobType;
    }

    // ✅ Experience level filter
    if (experienceLevel) {
      query.experienceLevel = { $regex: experienceLevel, $options: "i" };
    }

    // ✅ Salary range filter
    if (salaryMin || salaryMax) {
      query.salary = {};
      if (salaryMin) query.salary.$gte = Number(salaryMin);
      if (salaryMax) query.salary.$lte = Number(salaryMax);
    }

    // ✅ Skills filter (match any skill in comma-separated list)
    if (skills) {
      const skillsArray = skills.split(",").map(s => s.trim());
      query.requirements = { 
        $in: skillsArray.map(skill => new RegExp(skill, 'i'))
      };
    }

    // ✅ Date filter (jobs posted after date)
    if (dateFrom) {
      query.createdAt = { $gte: new Date(dateFrom) };
    }

    // ✅ Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Job.countDocuments(query);

    // ✅ Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // ✅ Execute query with pagination
    const jobs = await Job.find(query)
      .populate("company")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        jobsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Filtered jobs error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch filtered jobs",
      error: error.message
    });
  }
};

// ✅ GET JOB BY ID (Student View)
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    const job = await Job.findById(jobId)
      .populate("company")
      .populate("applications");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found."
      });
    }

    return res.status(200).json({ 
      success: true, 
      job 
    });

  } catch (error) {
    console.error('Get job by ID error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details",
      error: error.message
    });
  }
};

// ✅ GET JOBS CREATED BY ADMIN / EMPLOYER
export const getAdminJobs = async (req, res) => {
  try {
    const userId = req.id;
    console.log('📊 getAdminJobs called for user:', userId);

    if (!userId) {
      console.log('❌ No user ID found in request');
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const jobs = await Job.find({ created_by: userId })
      .populate("company")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${jobs ? jobs.length : 0} jobs for user ${userId}`);

    return res.status(200).json({
      success: true,
      jobs: jobs || [],
      count: jobs ? jobs.length : 0,
      message: jobs && jobs.length > 0 ? "Jobs fetched successfully" : "No jobs found"
    });

  } catch (error) {
    console.error('❌ Get admin jobs error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your jobs",
      error: error.message
    });
  }
};

// UPDATE JOB - employer or admin
export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Authorize: only creator or admin can update
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (String(job.created_by) !== String(userId) && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: not allowed to edit this job' });
    }

    // Fields from body
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId
    } = req.body;

    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (requirements !== undefined) job.requirements = Array.isArray(requirements) ? requirements : requirements.split(',').map(r => r.trim());
    if (salary !== undefined) job.salary = Number(salary);
    if (location !== undefined) job.location = location;
    if (jobType !== undefined) job.jobType = jobType;
    if (experience !== undefined) job.experienceLevel = experience;
    if (position !== undefined) job.position = position;
    if (companyId !== undefined) job.company = companyId;

    await job.save();
    await job.populate('company');

    return res.status(200).json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Update job error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update job', error: error.message });
  }
};
