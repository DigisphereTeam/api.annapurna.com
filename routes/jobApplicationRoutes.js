const express = require("express");

const { resumeUpload } = require("../utils/fileupload");
const { createJobApplication } = require("../Controller/jobApplicationController");

const jobApplicationRouter = express.Router();

jobApplicationRouter.post(
  "/",
  (req, res, next) => {
    resumeUpload.single("resume")(req, res, (err) => {
      if (err) {
        console.error("Resume Upload Error:", err);

        // File size exceeded
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.json({
            success: false,
            statusCode: 400,
            message: "Resume file size must not exceed 5 MB"
          });
        }

        // Unexpected file field
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.json({
            success: false,
            statusCode: 400,
            message: "Invalid resume file field"
          });
        }

        // Incomplete or empty multipart form
        if (err.message === "Unexpected end of form") {
          return res.json({
            success: false,
            statusCode: 400,
            message: "Job application details are missing or incomplete"
          });
        }

        // Other upload errors
        return res.json({
          success: false,
          statusCode: 400,
          message: "Failed to upload resume"
        });
      }

      next();
    });
  },
  createJobApplication
);

module.exports = jobApplicationRouter;