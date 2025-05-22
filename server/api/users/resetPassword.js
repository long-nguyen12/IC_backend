const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('./users.model');


async function sendResetPasswordEmail(userEmail, resetToken) {
    const transporter = nodemailer.createTransport({
        service: 'Mailjet',
        host: 'in-v3.mailjet.com',
        port: 587,
        secure: false,
        auth: {
            user: '951a0ae246b8c01ef1754a507f383cf1',
            pass: '52d874c3eeb235f09b1948e595b92b7f',
        },
    });

    const resetUrl = `https://iclabel.ailabs.io.vn/forgot-password?token=${resetToken}`;

    const mailOptions = {
        from: 'ailabs@ailabs.io.vn',
        to: userEmail,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
        html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                     <a href="${resetUrl}">${resetUrl}</a>`,
    };

    await transporter.sendMail(mailOptions);
}


function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}


async function resetPasswordHandler(req, res) {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'Email not found' });
    }

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const resetToken = generateResetToken();


    await User.updateOne({ email }, { resetToken, resetTokenExpires: Date.now() + 600000 });


    try {
        await sendResetPasswordEmail(email, resetToken);
        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send email' });
    }
}

module.exports = resetPasswordHandler;
