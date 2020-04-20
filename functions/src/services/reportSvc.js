(function () {
    var Report = require('../model/report'),
        modelUserLogSvc = require('../services/modelUserLogSvc'),
        ActionType = require('../shared/actionType');

    module.exports = {
        getReports: getReports,
        addReport: addReport,
        deleteReport: deleteReport,
        deleteAllReportsInsideAnItem: deleteAllReportsInsideAnItem
    };

    function getReports(options) {
        return new Promise((resolve, reject) => {
            Report.find(options.conditions, {}, (err, reports) => {
                if (err) {
                    return reject(err);
                }
                return resolve(reports);
            }).sort(options.order).skip(options.page * options.perPage).limit(options.perPage);
        });
    }

    /** Add report */
    function addReport(report) {
        return new Promise((resolve, reject) => {
            Report.findOneAndUpdate({
                "reportedByUser._id": report.reportedByUser._id,
                "reportedItemId": report.reportedItemId,
                "reportedCommentId": report.reportedCommentId
            }, report, { upsert: true, 'new': true}, (err, newReport) => {
                if (err) {
                    return reject(err);
                }
                modelUserLogSvc.updateOrCreateModelUserLog(newReport.reportedItemId, newReport.reportedCommentId, newReport.reportedByUser._id, null, null, ActionType.REPORTED);
                return resolve(newReport);
            });
        });
    }

    /** Delete report */
    function deleteReport(conditions) {
        return new Promise((resolve, reject) => {
            Report.deleteMany(conditions, (err, report) => {
                if (err) {
                    return reject(err);
                }
                modelUserLogSvc.updateOrCreateModelUserLog(conditions.reportedItemId, conditions.reportedCommentId, conditions["reportedByUser._id"], null, null, ActionType.UNREPORTED);
                return resolve(report);
            });
        });
    }

    function deleteAllReportsInsideAnItem(itemId) {
        return new Promise((resolve, reject) => {
            Report.deleteMany({ reportedItemId: itemId }, (err, reports) => {
                if (err) {
                    return reject(err);
                }
                return resolve(reports);
            });
        });
    }
}());