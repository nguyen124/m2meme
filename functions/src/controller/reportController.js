(function () {
    var router = require('express').Router(),
        reportSvc = require('../services/reportSvc'),
        middleware = require('../../util/middleware'),
        status = require('http-status'),
        moment = require('moment');

    /*
    Service to create new report
    */
    router.post('/svc/reports', middleware.isValidUser, function (req, res) {
        var report = req.body;
        report.reportedDate = moment().format("YYYY-MM-DD");
        report.status = "NEW"
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

    /** Update report */
    router.put('/svc/reports/:id', middleware.isValidUser, function (req, res) {

    });

    /** Delete report */
    router.delete('/svc/reports', middleware.isValidUser, function (req, res) {
        var conditions = {
            reportedItemId: req.query["reportedItemId"],
            "reportedByUser._id": req.user.id
        };
        var reportedCommentId = req.query["reportedCommentId"];
        if (reportedCommentId) {
            conditions = Object.assign(conditions, { reportedCommentId: reportedCommentId })
        }
        reportSvc.deleteReport(conditions).then(function (result) {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });
    module.exports = router;
}());