(function () {
    var Notification = require('../model/notification');

    module.exports = {
        getNotifications: getNotifications,
        updateNotification: updateNotification,
        createNotification: createNotification,
        checkNotifications: checkNotifications
    };

    function getNotifications(options) {
        return new Promise((resolve, reject) => {
            Notification.find(options.conditions, {}, (err, notifications) => {
                if (err) {
                    reject(err);
                }
                for (var noti of notifications) {
                    if (!noti.hasRead) {
                        updateNotification({ _id: noti._id }, { hasRead: true }, {});
                    }
                }
                resolve(notifications);
            }).sort(options.order).skip(options.page * options.perPage).limit(options.perPage);
        });
    }

    function updateNotification(conditions, newInfo, options) {
        return new Promise((resolve, reject) => {
            Notification.updateOne(conditions, newInfo, options, (err, updatedInfo) => {
                if (err) {
                    reject(err);
                }
                resolve(updatedInfo);
            });
        });
    }

    function createNotification(notification) {
        return new Promise((resolve, reject) => {
            Notification.create(notification, (err, notification) => {
                if (err) {
                    reject(err);
                }
                resolve(notification);
            });
        });
    }

    function checkNotifications(userId) {
        return new Promise((resolve, reject) => {
            Notification.findOne({ userId: userId, hasRead: false }, (err, res) => {
                if (err) {
                    reject(err);
                }
                if (res) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
}());