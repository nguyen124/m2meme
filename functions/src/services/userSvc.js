(function () {
  var User = require("../model/user"),
    commentSvc = require("./commentSvc"),
    itemSvc = require("./itemSvc"),
    moment = require("moment"),
    emailSvc = require("../services/emailSvc");

  module.exports = {
    updateUser: updateUser,
    registerUser: registerUser,
    requestResetPassword: requestResetPassword,
    resetPassword: resetPassword,
    activateUser: activateUser,
  };

  function requestResetPassword(obj) {
    return new Promise((resolve, reject) => {
      let tempPass = makeid(9);
      let expriredDate = Date.now() + 300000; // expire in 5 minutes;

      User.findOneAndUpdate(
        { email: obj.email },
        { resetPasswordToken: tempPass, resetPasswordExpires: expriredDate },
        { new: true },
        (err, newUser) => {
          if (err) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return reject("resetPassword.validate.error");
          }
          if (newUser) {
            //Send temp pass to email
            emailSvc
              .sendEmail({
                targetEmail: newUser.email,
                resetPasswordToken: newUser.resetPasswordToken,
              })
              .then((result) => {
                return resolve(result);
              })
              .catch((err) => {
                console.log(err);
                // eslint-disable-next-line prefer-promise-reject-errors
                return reject("resetPassword.validate.sendTempPassError");
              });
          } else {
            return resolve(false);
          }
        }
      );
    });
  }

  function resetPassword(obj) {
    var cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - 5);

    return new Promise((resolve, reject) => {
      User.findOneAndUpdate(
        {
          email: obj.email,
          resetPasswordToken: obj.resetPasscode,
          resetPasswordExpires: { $gt: cutoff },
        },
        {
          resetPasswordToken: undefined,
          password: User.hashPassword(obj.password),
        },
        { new: true },
        (err, newUser) => {
          if (err) {
            return reject(err);
          }
          if (newUser) {
            return resolve(true);
          } else {
            return resolve(false);
          }
        }
      );
    });
  }

  function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  function updateUser(conditions, newUserInfo, options) {
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate(
        conditions,
        newUserInfo,
        options,
        (err, updatedUser) => {
          if (err) {
            return reject(err);
          }
          commentSvc.updateManyComments(
            { "replyTo.writtenBy.userId": updatedUser.id },
            {
              "replyTo.writtenBy": {
                username: updatedUser.username,
                avatar: updatedUser.avatar,
              },
            }
          );
          if (newUserInfo.hasAvatarChanged || newUserInfo.hasUsernameChanged) {
            commentSvc.updateCommentsOfAnUser(updatedUser);
            itemSvc.updateItemsOfAnUser(updatedUser);
          }
          return resolve(updatedUser);
        }
      );
    });
  }

  async function registerUser(info) {
    var result = await hasExisted(info);
    if (!result) {
      var hashStatus = makeid(24);
      // expire hashStatus in 15 minutes;
      let activateAccountExpires = Date.now() + 900000;
      console.log("hashStatus: " + hashStatus);
      var user = {
        username: info.username,
        email: info.email,
        password: User.hashPassword(info.password),
        avatar: info.avatar,
        joinedDate: moment().format("YYYY-MM-DD HH:mm:ss Z"),
        role: "USER",
        status: hashStatus,
        activateAccountExpires: activateAccountExpires,
      };
      var sentEmailOk = await emailSvc.sendActivateEmail(
        info.email,
        hashStatus
      );
      if (sentEmailOk) {
        return createNewUser(user);
      }
    }
    return null;
  }

  function activateUser(sts) {
    var cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - 15);
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate(
        { status: sts, activateAccountExpires: { $gt: cutoff } },
        { status: "ACTIVE", activateAccountExpires: "" },
        { new: true },
        (err, updatedUser) => {
          if (err) {
            return reject(err);
          }
          return resolve(updatedUser);
        }
      );
    });
  }

  function hasExisted(info) {
    return new Promise((resolve, reject) => {
      User.findOne(
        { $or: [{ email: info.email }, { username: info.username }] },
        (err, user) => {
          if (err) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return reject("register.validate.error");
          }
          if (user) {
            if (user.email === info.email) {
              // eslint-disable-next-line prefer-promise-reject-errors
              return reject("register.validate.existingEmail");
            } else if (user.username === info.username) {
              // eslint-disable-next-line prefer-promise-reject-errors
              return reject("register.validate.existingUsername");
            }
          }
          return resolve(null);
        }
      );
    });
  }

  function createNewUser(user) {
    return new Promise((resolve, reject) => {
      User.create(user, (err, newUser) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(newUser);
        }
      });
    });
  }
})();
