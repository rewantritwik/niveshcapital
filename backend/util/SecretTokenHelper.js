require("dotenv").config();
const jwt = require("jsonwebtoken");


module.exports.createSecretToken = (id, userId) => {
  return jwt.sign({ id, userId }, process.env.TOKEN_KEY || "fallback_token_key_for_safety", {
    expiresIn: "7d",
  });
};


module.exports.createRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_KEY || "fallback_refresh_token_key_for_safety", {
    expiresIn: "7d",
  });
};
