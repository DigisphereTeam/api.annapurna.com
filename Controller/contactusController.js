const pool = require('../db/db');
const transporter = require("../utils/mailConfig");
const { sendContactMail } = require("../utils/mailConfig");

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