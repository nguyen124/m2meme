(function () {
    const nodemailer = require("nodemailer");
    const environment =
      require("../../env.json")[process.env.NODE_ENV || "development"];
    const host = environment.host;
    const transporter = nodemailer.createTransport({
      host: environment.EMAIL_SERVER_HOST,
      secure: false,
      port: 587,
      auth: {
        user: environment.USERNAME,
        pass: environment.PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  
    module.exports = {
      sendEmail: sendEmail,
      sendActivateEmail: sendActivateEmail
    };
  
    function sendEmail(obj) {
      var mailOptions = {
        from: "info@troiviet.com",
        to: obj.targetEmail,
        subject: "Reset password passcode!",
        text:
          "Please use this temporary passcode " +
          obj.resetPasswordToken +
          " to reset password. The passcode will be expired in 5 minutes.",
        html:
          "<p>Please use this temporary passcode <strong>" +
          obj.resetPasswordToken +
          " </strong> to reset password. The passcode will be expired in 5 minutes.</p>",
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
  
    function sendActivateEmail(targetEmail, hashStatus) {
      var mailOptions = {
        from: "info@troiviet.com",
        to: targetEmail,
        subject: "Activate your TroiViet account!",
        text: `${new Date()}
        Dear wonderful customer
        Please click on this link to activate your account ${host}activate?${new URLSearchParams({hashStatus}).toString()}
        `,
        html:
          `<p>${new Date()}</p>
          <p>Dear wonderful customer</p>
          <p>Please click on this link to activate your account <a href="${host}activate?${new URLSearchParams({hashStatus}).toString()}">activate</a></p>
          `,
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
  })();
  