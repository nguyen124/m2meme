(function () {
    var Notification = require('../model/notification'),
        User = require('../model/user');

    module.exports = {
        getNotifications: getNotifications,
        updateNotification: updateNotification,
        createOrUpdateNotification: createOrUpdateNotification,
        checkNotifications: checkNotifications
    };

    function getNotifications(options) {
        return new Promise((resolve, reject) => {
            Notification.find(options.conditions, {}, (err, notifications) => {
                if (err) {
                    return reject(err);
                }
                processNotifications(notifications).then(processNotifications => {
                    return resolve(processNotifications);
                }).catch(err => {
                    console.log(err)
                });
            }).sort(options.order).skip(options.page * options.perPage).limit(options.perPage);
        });
    }

    function processNotifications(notifications) {
        var newNotis = notifications.map(async (noti) => {
            if (!noti.hasRead) {
                updateNotification({ _id: noti._id }, { hasRead: true }, {});
            }
            var users = await getUserInfo(noti);
            generateMessage(noti, users);
            return noti;
        });
        return Promise.all(newNotis);
    }

    function getUserInfo(notification) {
        var promiseArr = [];
        var length = notification.actionDoneByUsers.length;
        for (var i = length - 1; i >= length - 2; i--) {
            if (i >= 0) {
                promiseArr.push(getUserInfoById(notification.actionDoneByUsers[i], { username: 1 }));
            }
        }
        return Promise.all(promiseArr);
    }

    function getUserInfoById(id, projection) {
        return new Promise((resolve, reject) => {
            User.findById(id, projection, (err, user) => {
                if (err) {
                    return reject(err);
                }
                else {
                    return resolve(user);
                }
            });
        });
    }

    function generateMessage(notification, users) {
        var output = toUserNamesString(users),
            length = notification.actionDoneByUsers.length;
        if (length - 2 > 0) {
            var numberPipe = pipeNumber(length - 2),
                other = " other ";
            if (numberPipe > 1) {
                other = " others ";
            }
            notification.title = output + " and " + numberPipe + other + notification.action + " your " + commentOrPost(notification.commentId);
        } else {
            notification.title = output + " " + notification.action + " your " + commentOrPost(notification.commentId);
        }
        notification.message = "Your " + commentOrPost(notification.commentId) + "'s points is " + pipeNumber(notification.noOfPoints);
    }

    function commentOrPost(commentId) {
        return (commentId ? "comment" : "post");
    }

    function toUserNamesString(users) {
        var output = "";
        if (users) {
            var length = users.length;
            if (length === 1) {
                output += users[0].username;
            } else if (length === 2) {
                output += users[0].username + " and " + users[1].username;
            } else {
                for (var i = 0; i < length - 1; i++) {
                    output += users[i].username + ", ";
                }
                output += users[length - 1].username;
            }
        }
        return output;
    }

    function pipeNumber(value) {
        if (isNaN(value)) {
            return 0;
        }
        return Math.abs(value) > 999 ? Math.sign(value) * (+(Math.abs(value) / 1000).toFixed(1)) + 'k' : Math.sign(value) * Math.abs(value);
    }

    function updateNotification(conditions, newInfo, options) {
        return new Promise((resolve, reject) => {
            Notification.updateOne(conditions, newInfo, options, (err, updatedInfo) => {
                if (err) {
                    return reject(err);
                }
                return resolve(updatedInfo);
            });
        });
    }

    function createOrUpdateNotification(condition, notification) {
        return new Promise((resolve, reject) => {
            Notification.findOneAndUpdate(condition, notification, { upsert: true }, (err, notification) => {
                if (err) {
                    return reject(err);
                }
                return resolve(notification);
            });
        });
    }

    function checkNotifications(userId) {
        return new Promise((resolve, reject) => {
            Notification.findOne({ userId: userId, hasRead: false }, (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (res) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            });
        });
    }
}());