const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (email, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email not sent', error);
  }
};

module.exports = sendEmail;
