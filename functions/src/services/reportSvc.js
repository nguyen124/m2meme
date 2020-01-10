(function () {
    var Report = require('../model/report'),
        modelUserLogSvc = require('../services/modelUserLogSvc'),
        ActionType = require('../shared/actionType');


    module.exports = {
        addReport: addReport,
        deleteReport: deleteReport,
        deleteAllReportsInsideAnItem: deleteAllReportsInsideAnItem
    };

    /* Get reports */
    // function getReports(options) {
    //     return new Promise((resolve, reject) => {
    //         Report.find(options.conditions, {}, function (err, reports) {
    //             if (err) {
    //                 reject(err);
    //             }
    //             resolve(reports);
    //         }).sort(options.order).skip(options.page * options.perPage).limit(options.perPage);
    //     });
    // }

    /** Add report */
    function addReport(report) {
        return new Promise((resolve, reject) => {
            Report.create(report, function (err, report) {
                if (err) {
                    reject(err);
                }
                modelUserLogSvc.updateOrCreateModelUserLog(report.reportedItemId, report.reportedCommentId, report.reportedByUser._id, null, null, ActionType.REPORTED);
                resolve(report);
            });
        });
    }

    /** Delete report */
    function deleteReport(conditions) {
        return new Promise((resolve, reject) => {
            Report.deleteOne(conditions, function (err, report) {
                if (err) {
                    reject(err);
                }
                modelUserLogSvc.updateOrCreateModelUserLog(conditions.reportedItemId, conditions.reportedCommentId, conditions["reportedByUser._id"], null, null, ActionType.UNREPORTED);
                resolve(report);
            });
        });
    }

    function deleteAllReportsInsideAnItem(itemId) {
        return new Promise((resolve, reject) => {
            Report.deleteMany({ reportedItemId: itemId }, function (err, reports) {
                if (err) {
                    reject(err);
                }
                resolve(reports);
            })
        });
    }
}());