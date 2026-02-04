import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send password reset email
export const sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - TripToKailash',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2B4C8F;">TripToKailash</h1>
        </div>
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #666; font-size: 16px;">You requested to reset your password.</p>
        <p style="color: #666; font-size: 16px;">Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="padding: 14px 28px; background-color: #2B4C8F; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} TripToKailash. All rights reserved.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send email verification email
export const sendEmailVerificationEmail = async (email, verificationLink, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - TripToKailash',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2B4C8F;">TripToKailash</h1>
        </div>
        <h2 style="color: #333;">Welcome, ${username}! 🙏</h2>
        <p style="color: #666; font-size: 16px;">Thank you for registering with TripToKailash. Your spiritual journey begins here!</p>
        <p style="color: #666; font-size: 16px;">Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="padding: 14px 28px; background-color: #2B4C8F; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #999; font-size: 14px;">This verification link will expire in 24 hours.</p>
        <p style="color: #999; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} TripToKailash. All rights reserved.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (email, bookingDetails) => {
  const { userName, packageName, travelDate, numberOfPeople, price, bookingId } = bookingDetails;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Booking Confirmation - TripToKailash',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2B4C8F;">TripToKailash</h1>
        </div>
        <h2 style="color: #333;">Booking Confirmation 🎉</h2>
        <p style="color: #666; font-size: 16px;">Dear ${userName},</p>
        <p style="color: #666; font-size: 16px;">Your booking has been successfully submitted! Here are the details:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Booking ID:</td>
              <td style="padding: 10px 0; color: #333; font-weight: bold; border-bottom: 1px solid #eee;">#${bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Package:</td>
              <td style="padding: 10px 0; color: #333; font-weight: bold; border-bottom: 1px solid #eee;">${packageName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Travel Date:</td>
              <td style="padding: 10px 0; color: #333; font-weight: bold; border-bottom: 1px solid #eee;">${travelDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Number of People:</td>
              <td style="padding: 10px 0; color: #333; font-weight: bold; border-bottom: 1px solid #eee;">${numberOfPeople}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Total Price:</td>
              <td style="padding: 10px 0; color: #2B4C8F; font-weight: bold; font-size: 18px;">Nrs. ${parseFloat(price).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #666; font-size: 16px;">Our team will contact you within 24 hours to confirm your booking and discuss further details.</p>
        <p style="color: #666; font-size: 16px;">For any queries, please contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #2B4C8F;">${process.env.EMAIL_USER}</a></p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} TripToKailash. All rights reserved.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to TripToKailash! 🙏',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2B4C8F;">TripToKailash</h1>
        </div>
        <h2 style="color: #333;">Welcome to TripToKailash, ${username}! 🎉</h2>
        <p style="color: #666; font-size: 16px;">Your email has been verified successfully. You're now ready to start your spiritual journey!</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2B4C8F; margin-top: 0;">What you can do now:</h3>
          <ul style="color: #666; font-size: 14px; line-height: 1.8;">
            <li>Browse our amazing travel packages</li>
            <li>Book your dream pilgrimage to Mount Kailash</li>
            <li>Read and write reviews</li>
            <li>Manage your profile and bookings</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/packages" style="padding: 14px 28px; background-color: #2B4C8F; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; display: inline-block;">Explore Packages</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} TripToKailash. All rights reserved.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};