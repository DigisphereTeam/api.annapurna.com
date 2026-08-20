const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.HOSTINGER_MAIL_USER,
    pass: process.env.HOSTINGER_MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});


const careerTransporter = nodemailer.createTransport({
  host: process.env.HOSTINGER_MAIL_CAREER_HOST,
  port: Number(process.env.HOSTINGER_MAIL_CAREER_PORT),
  secure: Number(process.env.HOSTINGER_MAIL_CAREER_PORT) === 465,
  auth: {
    user: process.env.HOSTINGER_MAIL_CAREER_USER,
    pass: process.env.HOSTINGER_MAIL_CAREER_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

careerTransporter.verify(() => {
  console.log("✅ CAREER SMTP SERVER READY");
});

transporter.verify(() => {
  console.log("✅ SMTP SERVER READY");
});

exports.sendContactMail = async (data) => {
  await transporter.sendMail({
    from: `"Annapurna farms" <${process.env.HOSTINGER_MAIL_USER}>`,
    to: process.env.ADMIN_MAIL,
    subject: "Annapurna farms New Contact Enquiry",
    text: `
        name: ${data.name}
        Phone: ${data.phone_number}
        Email: ${data.email}
        Message: ${data.message}
        `,
  });
};

exports.sendOtpMail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Annapurna farms" <${process.env.HOSTINGER_MAIL_USER}>`,
    to: email,
    subject: "OTP Verification",
    html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">

          <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background: #198754; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">Annapurna farms</h1>
              <p style="color: #e6f0ff; margin: 5px 0 0;">Empowering Your Learning Journey</p>
            </div>

            <!-- Body -->
            <div style="padding: 25px; text-align: center;">

              <h2 style="color: #333;">Email Verification</h2>

              <p style="color: #555; font-size: 14px;">
                Hello,<br><br>
                Thank you for registering with <b>Annapurna farms</b>.
                Please use the OTP below to verify your email address.
              </p>

              <!-- OTP Box -->
              <div style="margin: 25px 0;">
                <span style="
                  display: inline-block;
                  padding: 15px 25px;
                  font-size: 24px;
                  letter-spacing: 5px;
                  font-weight: bold;
                  color: #198754;
                  border: 2px dashed #198754;
                  border-radius: 8px;
                ">
                  ${otp}
                </span>
              </div>

              <p style="color: #777; font-size: 13px;">
                This OTP is valid for <b>5 minutes</b>.
              </p>

              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                If you did not request this, please ignore this email.
              </p>

            </div>

            <!-- Footer -->
            <div style="background: #f0f0f0; padding: 15px; text-align: center;">
              <p style="font-size: 12px; color: #888; margin: 0;">
                © ${new Date().getFullYear()} Annapurna farms. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      `,
  });
};

exports.sendforgotpasswordOtpMail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Annapurna farms" <${process.env.HOSTINGER_MAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - Annapurna farms OTP",
    html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">

              <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">

                <!-- Header -->
                <div style="background: #198754; padding: 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0;">Annapurna farms</h1>
                  <p style="color: #e6f0ff; margin: 5px 0 0;">Secure Password Reset</p>
                </div>

                <!-- Body -->
                <div style="padding: 25px; text-align: center;">

                  <h2 style="color: #333;">Forgot Password Request</h2>

                  <p style="color: #555; font-size: 14px;">
                    Hello,<br><br>
                    We received a request to reset your password for your <b>Annapurna farms</b> account.
                  </p>

                  <p style="color: #555; font-size: 14px;">
                    Please use the OTP below to proceed with resetting your password:
                  </p>

                  <!-- OTP Box -->
                  <div style="margin: 25px 0;">
                    <span style="
                      display: inline-block;
                      padding: 15px 25px;
                      font-size: 24px;
                      letter-spacing: 5px;
                      font-weight: bold;
                      color: #198754;
                      border: 2px dashed #198754;
                      border-radius: 8px;
                    ">
                      ${otp}
                    </span>
                  </div>

                  <p style="color: #777; font-size: 13px;">
                    This OTP is valid for <b>5 minutes</b>.
                  </p>

                  <p style="color: #999; font-size: 12px; margin-top: 20px;">
                    If you did not request a password reset, please ignore this email or contact support.
                  </p>

                </div>

                <!-- Footer -->
                <div style="background: #f0f0f0; padding: 15px; text-align: center;">
                  <p style="font-size: 12px; color: #888; margin: 0;">
                    © ${new Date().getFullYear()} Annapurna farms. All rights reserved.
                  </p>
                </div>

              </div>
            </div>

            `,
  });
};


exports.sendDigisphereContactMail = async (data) => {
  await transporter.sendMail({
    from: `"Digisphere Tech" <${process.env.HOSTINGER_MAIL_USER}>`,
    to: process.env.ADMIN_MAIL,
    subject: "Digisphere Tech - New Contact Inquiry",
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background:#f5f7fa; padding:30px;">
        <div style="max-width:650px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; border:1px solid #e5e5e5;">

          <!-- Header -->
          <div style="background:#057DCD; color:#ffffff; padding:24px 30px;">
            <h2 style="margin:0; font-size:28px; font-weight:bold;">
              📩 Digisphere Tech - New Contact Inquiry
            </h2>
            <p style="margin:10px 0 0; color:#eaf6ff; font-size:15px; line-height:1.6;">
              A new inquiry has been submitted through the Digisphere Tech website.
            </p>
          </div>

          <!-- Body -->
          <div style="padding:30px;">

            <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse; font-size:15px;">

              <tr style="border-bottom:1px solid #eeeeee;">
                <td width="35%"><strong>Full Name</strong></td>
                <td>${data.full_name}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>Company Name</strong></td>
                <td>${data.company_name || "N/A"}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>Email Address</strong></td>
                <td>${data.email}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>Phone Number</strong></td>
                <td>${data.phone_number}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>Service Required</strong></td>
                <td>${data.service_required}</td>
              </tr>

            </table>

            <!-- Project Description -->
            <div style="margin-top:30px;">
              <h3 style="margin-bottom:12px; color:#057DCD;">
                Project Description
              </h3>

              <div style="
                background:#f8fbff;
                border-left:5px solid #057DCD;
                padding:18px;
                border-radius:6px;
                color:#374151;
                line-height:1.7;
                font-size:15px;">
                ${data.project_description}
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div style="
            background:#f8fafc;
            padding:18px;
            text-align:center;
            color:#6b7280;
            font-size:13px;
            border-top:1px solid #e5e7eb;">
            This email was generated automatically from the
            <strong style="color:#057DCD;">Digisphere Tech</strong> Contact Us form.
          </div>

        </div>
      </div>
    `,
  });
};

exports.sendJobApplicationMail = async (data) => {
  await careerTransporter.sendMail({
    from: `"Digisphere Careers" <${process.env.HOSTINGER_MAIL_CAREER_USER}>`,
    to: process.env.ADMIN_CAREER_MAIL,
    subject: `New Job Application - ${data.applied_role}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background:#f5f7fa; padding:30px;">
        <div style="
          max-width:650px;
          margin:auto;
          background:#ffffff;
          border-radius:10px;
          overflow:hidden;
          border:1px solid #e5e5e5;
        ">

          <div style="background:#198754; color:#ffffff; padding:24px 30px;">
            <h2 style="margin:0;">New Job Application</h2>
            <p style="margin:10px 0 0; color:#e8f5e9;">
              A new career application has been submitted.
            </p>
          </div>

          <div style="padding:30px;">
            <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse; font-size:15px;">

              <tr style="border-bottom:1px solid #eeeeee;">
                <td width="35%"><strong>Applied Role</strong></td>
                <td>${data.applied_role}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>Full Name</strong></td>
                <td>${data.full_name}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>Email</strong></td>
                <td>${data.email}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>Phone Number</strong></td>
                <td>${data.phone_number}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>Current Location</strong></td>
                <td>${data.current_location}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>Experience</strong></td>
                <td>${data.experience}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>LinkedIn</strong></td>
                <td>${data.linkedin_profile || "N/A"}</td>
              </tr>

              <tr style="border-bottom:1px solid #eeeeee;">
                <td><strong>Portfolio</strong></td>
                <td>${data.portfolio_url || "N/A"}</td>
              </tr>

            </table>

            <p style="color:#555; font-size:14px; margin-top:25px;">
              The applicant's resume is attached to this email.
            </p>
          </div>

          <div style="
            background:#f8fafc;
            padding:18px;
            text-align:center;
            color:#6b7280;
            font-size:13px;
            border-top:1px solid #e5e7eb;">
            This email was generated automatically from the
            <strong style="color:#198754;">Digisphere Careers</strong>
            application form.
          </div>

        </div>
      </div>
    `,
    attachments: [
      {
        filename: data.resumeFilename,
        path: data.resumePath,
      },
    ],
  });
};