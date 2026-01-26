import { User } from '../../Model/User/UserModel.js';
import jwt from 'jsonwebtoken';
import { sendEmailVerificationEmail } from '../../Utils/emailService.js';

// Verify Email Controller
export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Verification token missing.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isVerified) return res.status(200).json({ message: 'Email already verified.' });
    user.isVerified = true;
    await user.save();
    return res.status(200).json({ message: 'Email verified successfully.' });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

// Resend Verification Email Controller
export const resendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isVerified) return res.status(200).json({ message: 'Email already verified.' });
    // Generate new token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // You may want to pass username as well, if available
    await sendEmailVerificationEmail(user.email, `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`, user.fullName || user.email);
    return res.status(200).json({ message: 'Verification email sent.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resend verification email.' });
  }
};
