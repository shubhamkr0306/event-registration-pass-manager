const organizerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ORGANIZER') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Organizer privileges are required to access this resource.',
  });
};

const organizerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'ORGANIZER' || req.user.role === 'ADMIN')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Organizer or Administrator privileges are required.',
  });
};

module.exports = {
  organizerOnly,
  organizerOrAdmin,
};
