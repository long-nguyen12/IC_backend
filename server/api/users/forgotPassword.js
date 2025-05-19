const User = require('./users.model'); 
const crypto = require('crypto');

const forgotPassword = async (req, res) => {
    const {newPassword, tokenQuery } = req.body;

  
    try {
        const user = await User.findOne({
            resetToken: tokenQuery,
            resetTokenExpires: { $gt: Date.now() } // chưa hết hạn
        });

        if (!user) {
            return res.status(404).json({ message: 'Token không hợp lệ hoặc đã hết hạn'  });
        }

        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();


        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = forgotPassword;