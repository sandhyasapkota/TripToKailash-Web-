import crypto from 'crypto';
import { User } from '../../Model/User/UserModel.js';
import { sendEmailVerificationEmail } from '../../Utils/emailService.js';

// Verify Email Controller
export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Verification token missing.' });
  }

  try {
    // First check if any user has this token
    const user = await User.findOne({ where: { emailVerificationToken: token } });
    
    if (!user) {
      // Token not found - could be already used or invalid
      // Check if there's a user whose email was already verified
      return res.status(400).json({ 
        error: 'Invalid or expired token. If you have already verified your email, please login.',
        alreadyVerified: true
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: 'Email already verified. You can login now.' });
    }

    if (user.emailVerificationExpiry && user.emailVerificationExpiry < Date.now()) {
      return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully! You can now login.' });
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json({ error: 'Failed to verify email.' });
  }
};

// Resend Verification Email Controller
export const resendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isEmailVerified) return res.status(200).json({ message: 'Email already verified.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 86400000;

    user.emailVerificationToken = token;
    user.emailVerificationExpiry = expiry;
    await user.save();

    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    await sendEmailVerificationEmail(user.email, verificationLink, user.username || user.email);

    return res.status(200).json({ message: 'Verification email sent.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resend verification email.' });
  }
};
