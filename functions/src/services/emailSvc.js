(function () {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'me2meme.entertainment@gmail.com',
            pass: 'Nguy3nH0H@1'
        }
    });

    module.exports = {
        sendEmail: sendEmail
    };

    function sendEmail(obj) {
        var mailOptions = {
            from: 'me2meme.entertainment@gmail.com',
            to: obj.targetEmail,
            subject: 'Reset password passcode!',
            text: 'Please use this temporary passcode ' + obj.resetPasswordToken + ' to reset password. The passcode will be expired in 5 minutes.',
            html: '<p>Please use this temporary passcode <strong>' + obj.resetPasswordToken + ' </strong> to reset password. The passcode will be expired in 5 minutes.</p>'
        };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });
    }

}());