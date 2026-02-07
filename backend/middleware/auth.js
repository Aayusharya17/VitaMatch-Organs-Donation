const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/serverConfig");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = {
    authMiddleware
};
