const pool = require("../db/db");
const { sendJobApplicationMail } = require("../utils/mailConfig");

const createJobApplication = async (req, res) => {
  try {
    const {
      applied_role,
      full_name,
      email,
      phone_number,
      current_location,
      experience,
      linkedin_profile,
      portfolio_url
    } = req.body || {};

    const errors = {};

    if (!applied_role || !applied_role.toString().trim()) {
      errors.applied_role = "Applied role is required";
    } else if (applied_role.toString().trim().length > 150) {
      errors.applied_role = "Applied role must not exceed 150 characters";
    }

    if (!full_name || !full_name.toString().trim()) {
      errors.full_name = "Full name is required";
    } else if (full_name.toString().trim().length > 150) {
      errors.full_name = "Full name must not exceed 150 characters";
    }

    if (!email || !email.toString().trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toString().trim())
    ) {
      errors.email = "Please provide a valid email address";
    }

    if (!phone_number || !phone_number.toString().trim()) {
      errors.phone_number = "Phone number is required";
    }

    if (!current_location || !current_location.toString().trim()) {
      errors.current_location = "Current location is required";
    }

    if (!experience || !experience.toString().trim()) {
      errors.experience = "Experience is required";
    }

    if (linkedin_profile && typeof linkedin_profile !== "string") {
      errors.linkedin_profile = "Invalid LinkedIn profile";
    }

    if (portfolio_url && typeof portfolio_url !== "string") {
      errors.portfolio_url = "Invalid portfolio URL";
    }

    if (!req.file) {
      errors.resume = "Resume is required";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Validation failed",
        errors
      });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const result = await pool.query(
      `
        INSERT INTO tbl_job_applications (
          applied_role,
          full_name,
          email,
          phone_number,
          current_location,
          experience,
          linkedin_profile,
          portfolio_url,
          resume_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        applied_role.trim(),
        full_name.trim(),
        email.trim().toLowerCase(),
        phone_number.trim(),
        current_location.trim(),
        experience.trim(),
        linkedin_profile?.trim() || null,
        portfolio_url?.trim() || null,
        resumeUrl
      ]
    );

    sendJobApplicationMail({
      applied_role: result.rows[0].applied_role,
      full_name: result.rows[0].full_name,
      email: result.rows[0].email,
      phone_number: result.rows[0].phone_number,
      current_location: result.rows[0].current_location,
      experience: result.rows[0].experience,
      linkedin_profile: result.rows[0].linkedin_profile,
      portfolio_url: result.rows[0].portfolio_url,
      resumePath: req.file.path,
      resumeFilename: req.file.originalname
    }).catch((error) => {
      console.error("Job Application Mail Error:", error);
    });

    return res.json({
      success: true,
      statusCode: 201,
      message: "Application submitted successfully",
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Create Job Application Error:", error);

    return res.json({
      success: false,
      statusCode: 500,
      message: "Internal server error"
    });
  }
};

module.exports = {
  createJobApplication
};