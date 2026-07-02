const User = require("../model/UserModel");
const { createSecretToken, createRefreshToken } = require("../util/SecretTokenHelper");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");


const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};


module.exports.Signup = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      username,
      isVerified: true,
    });

    const accessToken = createSecretToken(user._id, user.userId);
    const refreshToken = createRefreshToken(user._id);

    
    res.cookie("token", accessToken, {
      withCredentials: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    
    res.cookie("refreshToken", refreshToken, {
      withCredentials: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Account created successfully",
      success: true,
      accessToken,
      id: user.userId,
      name: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user: " + error.message });
  }
};


module.exports.VerifyEmail = async (req, res) => {
  try {
    const token = req.body.token || req.query.token;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Verification link is invalid or has expired" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    const accessToken = createSecretToken(user._id, user.userId);

    
    res.cookie("token", accessToken, {
      withCredentials: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      message: "Email verified successfully",
      success: true,
      id: user.userId,
      name: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Verification error: " + error.message });
  }
};


module.exports.Login = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }



    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = createSecretToken(user._id, user.userId);
    const refreshToken = createRefreshToken(user._id);

    
    res.cookie("token", accessToken, {
      withCredentials: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    
    res.cookie("refreshToken", refreshToken, {
      withCredentials: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      accessToken,
      id: user.userId,
      name: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login error: " + error.message });
  }
};


module.exports.ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    
    const successMsg = "If that email exists, a reset link has been sent";

    if (!user) {
      return res.status(200).json({ message: successMsg });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; 
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3001";
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #f9f9f9;">
        <h2 style="color: #10b981; text-align: center;">Password Reset Request</h2>
        <p>Hi ${user.username},</p>
        <p>You requested a password reset for your NiveshCapital account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all;"><a href="${resetLink}">${resetLink}</a></p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">This reset link expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail(user.email, "Password Reset Request — NiveshCapital", htmlContent);

    res.status(200).json({ message: successMsg });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error processing forgot password request: " + error.message });
  }
};


module.exports.ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #f9f9f9;">
        <h2 style="color: #10b981; text-align: center;">Password Updated</h2>
        <p>Hi ${user.username},</p>
        <p>Your NiveshCapital password has been changed successfully. You can now log in using your new credentials.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">If you did not request this change, please contact support immediately.</p>
      </div>
    `;

    await sendEmail(user.email, "Password Changed Successfully — NiveshCapital", htmlContent);

    res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password: " + error.message });
  }
};


module.exports.RefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const refreshSecret = process.env.REFRESH_TOKEN_KEY || "fallback_refresh_token_key_for_safety";
    jwt.verify(refreshToken, refreshSecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const newAccessToken = createSecretToken(decoded.id);

      
      res.cookie("token", newAccessToken, {
        withCredentials: true,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Error refreshing token: " + error.message });
  }
};


module.exports.Logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout error: " + error.message });
  }
};