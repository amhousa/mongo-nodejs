// /services/email.service.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // اگر SMTP داری می‌تونی تغییر بدی
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

module.exports = {
  sendVerificationEmail: async (email, code) => {
    const mailOptions = {
      from: `"Auth System" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
        <h2>Verification Code</h2>
        <p>Your code is:</p>
        <h1>${code}</h1>
        <p>This code will expire in 5 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  },

  sendResetPassword: async (email, code) => {
    const mailOptions = {
      from: `"Auth System" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Your reset code is:</p>
        <h1>${code}</h1>
        <p>This code will expire in 5 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  },
};
