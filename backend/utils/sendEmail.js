
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD
  }
})

const sendOTPEmail = async (email, otp) => {
  await transport.sendMail({
    from: `"Lodge Booking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Login OTP",
    text: `Your login OTP is ${otp}. It will expire in 2 minutes.`,
  })
}

module.exports = sendOTPEmail;  