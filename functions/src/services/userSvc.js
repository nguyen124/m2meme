(function() {
    var User = require('../model/user'),
        commentSvc = require('./commentSvc'),
        itemSvc = require('./itemSvc'),
        moment = require('moment');

    module.exports = {
        updateUser: updateUser,
        registerUser: registerUser
    };

    function updateUser(conditions, newUserInfo, options) {
        return new Promise((resolve, reject) => {
            User.findOneAndUpdate(conditions, newUserInfo, options, (err, updatedUser) => {
                if (err) {
                    reject(err);
                }
                commentSvc.updateManyComments({ "replyTo.writtenBy.userId": updatedUser.id }, { "replyTo.writtenBy": { username: updatedUser.username, avatar: updatedUser.avatar } });
                if (newUserInfo.hasAvatarChanged || newUserInfo.hasUsernameChanged) {
                    commentSvc.updateCommentsOfAnUser(updatedUser);
                    itemSvc.updateItemsOfAnUser(updatedUser);
                }
                resolve(updatedUser);
            });
        });
    }

    async function registerUser(info) {
        var result = await hasExisted(info);

        if (!result) {
            var user = {
                username: info.username,
                email: info.email,
                password: User.hashPassword(info.password),
                avatar: info.avatar,
                joinedDate: moment().format("YYYY-MM-DD HH:mm Z"),
                role: "USER"
            };
            return createNewUser(user);
        }
        return null;
    }

    function hasExisted(info) {
        return new Promise((resolve, reject) => {
            User.findOne({ $or: [{ email: info.email }, { username: info.username }] }, (err, user) => {
                if (err) {
                    reject(err);
                }
                if (user) {
                    if (user.email === info.email) {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject('Email has been used!');
                    } else if (user.username === info.username) {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject('Username has been used!');
                    }
                }
                resolve(null);
            });
        });
    }

    function createNewUser(user) {
        return new Promise((resolve, reject) => {
            User.create(user, (err, newUser) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(newUser);
                }
            });
        });
    }
}());