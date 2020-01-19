(function () {
    var router = require('express').Router(),
        notificationSvc = require('../services/notificationSvc'),
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
        notificationSvc.checkIfThereIsUnreadNotifications(req.user.id).then((yesno) => {
            return res.status(status.OK).json(yesno);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    function getOptions(req) {
        var options = {
            page: getPageNo(req.query.page),
            perPage: getPerPageNo(req.query.perPage),
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

    function getPageNo(page) {
        if (page && !isNaN(page)) {
            return Number(page);
        }
        return 0;
    }

    function getPerPageNo(perPage) {
        if (perPage && !isNaN(perPage)) {
            return Number(perPage);
        }
        return 5;
    }

    module.exports = router;
}());