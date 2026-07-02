const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"NiveshCapital" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })
    console.log('Email sent:', info.messageId)
    return info
  } catch (err) {
    console.error('Email send error:', err.message)
    
  }
}

module.exports = { sendEmail }
