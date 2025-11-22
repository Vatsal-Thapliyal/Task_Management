const roleBasedAuthorization = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User Unauthorized" });
      }

      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "User is not permitted to perform this action" });
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        message: "Internal Server error in role authorization middleware", 
        error: error.message 
      });
    }
  };
};

module.exports = { roleBasedAuthorization };