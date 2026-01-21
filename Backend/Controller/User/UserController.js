import {User} from '../../Model/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendEmailVerificationEmail, sendWelcomeEmail } from '../../Utils/emailService.js';
import nodemailer from 'nodemailer';

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry', 'emailVerificationToken', 'emailVerificationExpiry'] }
    });
    res.status(200).json({data: users, message: "Users fetched successfully"});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Register new user with email verification
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ error: "Full name, email, phone, and password are required" });
    }

    // Validate fullName length
    if (fullName.trim().length < 3) {
      return res.status(400).json({ error: "Full name must be at least 3 characters" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Phone number must be 10 digits" });
    }

    // Validate password length and strength
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpiry = Date.now() + 86400000; // 24 hours

    // Create new user
    const newUser = await User.create({ 
      username: fullName, 
      email: email, 
      password: hashedPassword, 
      phone: phone,
      role: 'user',
      isEmailVerified: false,
      emailVerificationToken: emailVerificationToken,
      emailVerificationExpiry: emailVerificationExpiry
    });

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;
    console.log('=== EMAIL VERIFICATION LINK ===');
    console.log(verificationLink);
    console.log('================================');

    // Try to send email
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        await sendEmailVerificationEmail(email, verificationLink, fullName);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue anyway - verification link is logged to console
    }

    res.status(201).json({ 
      data: { id: newUser.id, username: newUser.username, email: newUser.email }, 
      message: "Registration successful! Please check your email to verify your account.",
      verificationLink: process.env.NODE_ENV === 'development' ? verificationLink : undefined
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      return res.status(400).json({ error: `This ${field} is already registered` });
    }
    
    res.status(500).json({ error: "Failed to register user. Please try again." });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const user = await User.findOne({ 
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    // Check if token is expired
    if (user.emailVerificationExpiry < Date.now()) {
      return res.status(400).json({ error: "Verification link has expired. Please request a new one." });
    }

    // Update user
    await user.update({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null
    });

    // Send welcome email
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        await sendWelcomeEmail(user.email, user.username);
      }
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    res.status(200).json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: "Failed to verify email" });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpiry = Date.now() + 86400000; // 24 hours

    await user.update({
      emailVerificationToken: emailVerificationToken,
      emailVerificationExpiry: emailVerificationExpiry
    });

    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;
    console.log('=== NEW EMAIL VERIFICATION LINK ===');
    console.log(verificationLink);
    console.log('===================================');

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        await sendEmailVerificationEmail(email, verificationLink, user.username);
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(200).json({ 
      message: "Verification email sent! Please check your inbox.",
      verificationLink: process.env.NODE_ENV === 'development' ? verificationLink : undefined
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if email is verified (skip for admin users)
    if (!user.isEmailVerified && user.role !== 'admin') {
      return res.status(403).json({ 
        error: "Please verify your email before logging in",
        needsVerification: true,
        email: user.email
      });
    }

    // Set token expiry based on rememberMe option
    const tokenExpiry = rememberMe ? '7d' : '24h';

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: tokenExpiry }
    );

    res.status(200).json({ 
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Failed to login" });
  }
};

const createUser = async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    if (!body.username || !body.email) {
      return res.status(400).json({ error: "Username and Email are required" });
    }
    const newUser = await User.create({ username: body.username, email: body.email, password: body.password, role: body.role });
    res.status(201).json({ data: newUser, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ data: user, message: "User fetched successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const body = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.update(body);
    res.status(200).json({ data: user, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save token to user
    await user.update({
      resetToken: resetToken,
      resetTokenExpiry: resetTokenExpiry
    });

    // FOR DEVELOPMENT: Just log the reset link (skip email sending)
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log('=== PASSWORD RESET LINK ===');
    console.log(resetLink);
    console.log('===========================');

    // Skip email sending for now
    if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your-email@gmail.com') {
      // Only send email if configured
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Password Reset Request - TripToKailash',
          html: `
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below to reset:</p>
            <a href="${resetLink}" style="padding: 10px 20px; background-color: #2B4C8F; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          `
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue anyway - link is logged to console
      }
    }

    res.status(200).json({
      message: "Password reset link generated. Check server console for the link (email not configured).",
      // In development, you can include the link in response
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: "Failed to process request: " + error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    const user = await User.findOne({ 
      where: { 
        resetToken: token,
      } 
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if token is expired
    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Update user's profile picture path
    await user.update({ profilePicture: req.file.filename });

    res.status(200).json({ 
      data: { profilePicture: req.file.filename }, 
      message: "Profile picture uploaded successfully" 
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
};

// Verify token endpoint for frontend validation
const verifyTokenEndpoint = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.status(200).json({ 
      valid: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Export at the end
export { 
  getAllUsers, 
  createUser, 
  getUserById, 
  updateUserById, 
  deleteUserById, 
  registerUser, 
  loginUser,
  forgotPassword,
  resetPassword,
  uploadProfilePicture,
  verifyTokenEndpoint,
  verifyEmail,
  resendVerificationEmail
};