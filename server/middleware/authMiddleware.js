// TODO: Implement authentication and authorization middleware
// This middleware should verify JWT tokens, attach user data, and check roles.

const protect = (req, res, next) => {
  // Placeholder allowing request to proceed
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // Placeholder allowing request to proceed
    next();
  };
};

module.exports = {
  protect,
  authorize
};
