(function () {
    var router = require('express').Router(),
        reportSvc = require('../services/reportSvc'),
        sharedSvc = require('../shared/utilSvc'),
        middleware = require('../../util/middleware'),
        status = require('http-status'),
        moment = require('moment');

    /*
    Service to get reports 
    */
    router.get('/svc/reports', middleware.isAdmin, (req, res) => {
        var options = getOptions(req);
        reportSvc.getReports(options).then((reports) => {
            return res.status(status.OK).json(reports);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    function getOptions(req) {
        var options = {
            page: sharedSvc.getPageNo(req.query.page, 0),
            perPage: sharedSvc.getPageNo(req.query.perPage, 40),
            order: { modifiedDate: 1 },
            conditions: {
                status: "NEW"
            }
        };
        return options;
    }

    /*
    Service to create new report
    */
    router.post('/svc/reports', middleware.isValidUser, (req, res) => {
        var report = req.body;
        report.reportedDate = moment().format("YYYY-MM-DD HH:mm Z");
        report.status = "NEW";
        report.reportedByUser = {
            _id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            familyName: req.user.familyName,
            givenName: req.user.givenName
        };
        reportSvc.addReport(report).then(newReport => {
            return res.status(status.OK).json(newReport);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /** Delete report */
    router.delete('/svc/reports', middleware.isValidUser, (req, res) => {
        var conditions = {
            reportedItemId: req.query.reportedItemId
        };
        if (req.user.role != 'ADMIN') {
            conditions = Object.assign(conditions, { "reportedByUser._id": req.user.id });
        }
        var reportedCommentId = req.query.reportedCommentId;
        if (reportedCommentId) {
            conditions = Object.assign(conditions, { reportedCommentId: reportedCommentId });
        }
        reportSvc.deleteReport(conditions).then((result) => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });
    module.exports = router;
}());