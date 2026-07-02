const User = require("../model/UserModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] 
    || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ 
      message: "Access denied. Please log in." 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY || "fallback_token_key_for_safety");
    
    
    if (!decoded.userId) {
      return res.status(403).json({ 
        message: "Invalid token. Please log in again." 
      });
    }
    
    req.user = decoded;  
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        message: "Session expired. Please log in again." 
      });
    }
    return res.status(403).json({ 
      message: "Invalid token." 
    });
  }
};