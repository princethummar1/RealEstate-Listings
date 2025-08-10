// server/config/mailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Gmail SMTP Host
    port: 587,              // Gmail SMTP Port (for STARTTLS)
    secure: false,          // false for port 587 (uses STARTTLS)
    auth: {
        user: 'princethummar199@gmail.com', // Your Full Gmail Address
        pass: 'hvtz uars ffbh whwr', // <--- REPLACE 'hello@2212' WITH YOUR ACTUAL APP PASSWORD HERE
    },
});

const sendEmail = async (options) => {
    const mailOptions = {
        from: `"RealEstate" <princethummar199@gmail.com>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.to} via Gmail.`);
    } catch (error) {
        console.error('Nodemailer Error:', error);
        throw error;
    }
};

export default sendEmail;