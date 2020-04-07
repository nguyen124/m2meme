(function () {
    var router = require('express').Router(),
        notificationSvc = require('../services/notificationSvc'),
        sharedSvc = require('../shared/utilSvc'),
        middleware = require('../../util/middleware'),
        status = require('http-status');

    //** NOTIFICATION **/
    router.get('/svc/notifications', middleware.isValidUser, (req, res) => {
        var options = getOptions(req);
        notificationSvc.getNotifications(options).then((notifications) => {
            return res.status(status.OK).json(notifications);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    router.get('/svc/notifications/hasnew', middleware.isValidUser, (req, res) => {
        notificationSvc.checkNotifications(req.user.id).then((yesno) => {
            return res.status(status.OK).json(yesno);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    function getOptions(req) {
        var options = {
            page: sharedSvc.getPageNo(req.query.page, 0),
            perPage: sharedSvc.getPageNo(req.query.perPage, 5),
            order: { notifiedDate: -1 },
            conditions: {
                userId: req.user.id
            }
        };

        var page = req.query.page;
        if (page && !isNaN(page)) {
            options.page = page;
        }
        return options;
    }

    module.exports = router;
}());