const pool = require("../db/db");
const { sendNewSubscriptionNotification } = require("../utils/mailConfig");

const createSubscription = async (req, res) => {
  try {
    const { email } = req.body;

    if (email === undefined || email === null || !email.toString().trim()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Email is required"
      });
    }

    if (typeof email !== "string") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Email must be a string"
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Please provide a valid email address"
      });
    }

    if (trimmedEmail.length > 255) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Email must not exceed 255 characters"
      });
    }

    const existingSubscription = await pool.query(
      `
        SELECT subscription_id, email, status
        FROM tbl_subscriptions
        WHERE email = $1
      `,
      [trimmedEmail]
    );

    if (existingSubscription.rows.length > 0) {
      const subscription = existingSubscription.rows[0];

      if (subscription.status === true) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          message: "Email is already subscribed"
        });
      }

      const result = await pool.query(
        `
          UPDATE tbl_subscriptions
          SET
            status = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE subscription_id = $1
          RETURNING *
        `,
        [subscription.subscription_id]
      );

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Subscription activated successfully",
        data: result.rows[0]
      });
    }

    const result = await pool.query(
      `
        INSERT INTO tbl_subscriptions (email)
        VALUES ($1)
        RETURNING *
      `,
      [trimmedEmail]
    );

    sendNewSubscriptionNotification(trimmedEmail)
      .catch((error) => {
        console.error("Subscription Email Error:", error);
      });

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Subscribed successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Create Subscription Error:", error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal server error"
    });
  }
};

module.exports = {
  createSubscription
};