(function () {
    const nodemailer = require('nodemailer');
    environment = require('../../env.json')[process.env.NODE_ENV || 'development'];
    const transporter = nodemailer.createTransport({
        host: environment.EMAIL_SERVER_HOST,
        secure: false,
        port: 587,
        auth: {
            user: environment.USERNAME,
            pass: environment.PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
    });

    module.exports = {
        sendEmail: sendEmail
    };

    function sendEmail(obj) {
        var mailOptions = {
            from: 'troivietcompany@gmail.com',
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