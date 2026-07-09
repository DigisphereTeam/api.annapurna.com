const pool = require('../db/db');
const transporter = require("../utils/mailConfig");
const { sendContactMail, sendDigisphereContactMail } = require("../utils/mailConfig");

exports.contactUs = async (req, res) => {
  const {
    name,
    phone_number,
    email,
    message,
  } = req.body;

  if (
    !name ||
    !phone_number ||
    !email ||
    !message
  ) {
    return res.status(400).json({
      statusCode: 400,
      message: "Missing required fields",
    });
  }

  try {
    // Save to DB
    await pool.query(
      `INSERT INTO tbl_contact_us
            (name, phone_number, email, message)
            VALUES ($1,$2,$3,$4)
            RETURNING *`,
      [
        name,
        phone_number,
        email,
        message,
      ],
    );

    // Send Mail
    sendContactMail({
      name,
      phone_number,
      email,
      message,
    }).catch(() => { });

    return res.status(200).json({
      statusCode: 200,
      message: "Contact submitted & mail sent successfully"
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.submitContactInquiry = async (req, res) => {

  const { full_name, company_name, email, phone_number, service_required, project_description} = req.body;

  const errors = {};

  if (!full_name || full_name.trim() === "") {
    errors.full_name = "Full name is required.";
  }

  if (!email || email.trim() === "") {
    errors.email = "Email address is required.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = "Please enter a valid email address.";
  }

  if (!phone_number || phone_number.trim() === "") {
    errors.phone_number = "Phone number is required.";
  } else if (!/^[6-9]\d{9}$/.test(phone_number)) {
    errors.phone_number = "Please enter a valid 10-digit mobile number.";
  }

  if (!service_required || service_required.trim() === "") {
    errors.service_required = "Please select the service you need.";
  }

  if (!project_description || project_description.trim() === "") {
    errors.project_description = "Project description is required.";
  } else if (project_description.trim().length < 20) {
    errors.project_description =
      "Project description should be at least 20 characters long.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      statusCode: 422,
      message: "Validation failed.",
      errors,
    });
  }
  try {
    const result = await pool.query(
      `
      INSERT INTO tbl_digisphere_contact_us
      (
        full_name,
        company_name,
        email,
        phone_number,
        service_required,
        project_description
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *;
      `,
      [
        full_name,
        company_name || null,
        email,
        phone_number,
        service_required,
        project_description,
      ]
    );


    sendDigisphereContactMail({
      full_name,
      company_name,
      email,
      phone_number,
      service_required,
      project_description,
    }).catch(() => { });

    return res.status(200).json({
      statusCode: 200,
      message: "Your inquiry has been submitted successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  }
};