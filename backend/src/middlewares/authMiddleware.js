import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      return next();
    } catch (error) {
      console.error('Auth verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const authorizeRoles = (...roles) => {
  const normalizedRoles = roles.map((r) => r.toUpperCase());
  return (req, res, next) => {
    const userRole = req.user?.role?.toUpperCase();
    if (!req.user || !normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'UNKNOWN'}) is not authorized to access this resource`,
      });
    }
    next();
  };
};
