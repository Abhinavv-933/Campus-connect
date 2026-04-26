const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitizeUser = (userDoc) => ({
  _id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  role: userDoc.role,
  avatar: userDoc.avatar,
  isActive: userDoc.isActive,
});

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(201).json({
      message: 'Registration successful',
      user: sanitizeUser(user),
    });
  } catch (error) {
  console.error('REGISTER ERROR:', error) // add this
  return res.status(500).json({ message: 'Failed to register user', error: error.message });
}
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login', error: error.message });
  }
};

const logout = (req, res) => {
  res.cookie('token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return res.status(200).json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
