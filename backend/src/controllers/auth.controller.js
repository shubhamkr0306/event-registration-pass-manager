const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ROLES } = require('../config/constants');
const User = require('../models/User');

// Helper to generate signed JWT token
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

// @desc    Register a new user (Attendee or Organizer)
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Basic field validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email address, and password.',
      });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // 3. Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 4. Normalize and validate role
    let normalizedRole = ROLES.ATTENDEE;
    if (role && role.toUpperCase() === ROLES.ORGANIZER) {
      normalizedRole = ROLES.ORGANIZER;
    }

    // 5. Check for duplicate email in PostgreSQL
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 6. Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Create user in PostgreSQL
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
    });

    // 8. Generate JWT token
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.created_at,
      },
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while registering account.',
    });
  }
};

// @desc    Authenticate user & return JWT token
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.',
      });
    }

    // 2. Fetch user from PostgreSQL
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    // 3. Compare password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while logging in.',
    });
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /api/v1/auth/me
// @access  Private (Protected by JWT)
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.created_at,
      },
    });
  } catch (error) {
    console.error('[Auth GetMe Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving user profile.',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
