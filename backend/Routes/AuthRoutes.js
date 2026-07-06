const {
  Signup,
  VerifyEmail,
  Login,
  ForgotPassword,
  ResetPassword,
  RefreshToken,
  Logout,
} = require("../Controllers/AuthController");
const { userVerification } = require("../Middleware/AuthMiddleware");
const rateLimit = require("express-rate-limit");
const UserModel = require("../model/UserModel");
const { sendEmail } = require("../utils/sendEmail");
const router = require("express").Router();


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", Signup);
router.post("/verify-email", VerifyEmail);

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query
    if (!token) {
      return res.status(400).json({ 
        message: "Verification token is missing." 
      })
    }
    
    const user = await UserModel.findOne({ verificationToken: token })
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired verification link." 
      })
    }
    
    
    user.isVerified = true
    user.verificationToken = undefined
    await user.save()
    
    
    const { createSecretToken } = require('../util/SecretTokenHelper')
    const jwtToken = createSecretToken(user._id, user.userId)
    
    
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://niveshcapital-dashboard.vercel.app'
    res.redirect(
      `${dashboardUrl}/?token=${jwtToken}&id=${user.userId}&name=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}`
    )
  } catch (err) {
    console.error('Verify email error:', err)
    res.status(500).json({ message: "Verification failed: " + err.message })
  }
})

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body
    const user = await UserModel.findOne({ 
      email: email.toLowerCase().trim() 
    })
    
    if (!user) {
      
      return res.status(200).json({ 
        message: "If that email exists, a verification link has been sent." 
      })
    }
    
    if (user.isVerified) {
      return res.status(400).json({ 
        message: "This account is already verified. Please login." 
      })
    }
    
    
    const crypto = require('crypto')
    user.verificationToken = crypto.randomBytes(32).toString('hex')
    await user.save()
    
    const clientUrl = process.env.CLIENT_URL || 'https://niveshcapital.vercel.app';
    const verificationLink = 
      `${clientUrl}/verify-email?token=${user.verificationToken}`
    
    await sendEmail(
      email,
      'Verify your NiveshCapital account',
      `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
    )
    
    res.status(200).json({ 
      message: "Verification email resent. Please check your inbox." 
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/login", Login);
router.post("/logout", Logout);

router.post("/forgot-password", authLimiter, ForgotPassword);
router.post("/reset-password", authLimiter, ResetPassword);
router.post("/refresh-token", RefreshToken);


router.post("/verify", userVerification, (req, res) => {
  res.status(200).json({
    status: true,
    user: req.user.username,
    userId: req.user.userId,
    email: req.user.email,
  });
});

module.exports = router;