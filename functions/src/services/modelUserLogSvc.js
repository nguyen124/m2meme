(function () {
    var ModelUserLog = require('../model/modelUserLog'),
        moment = require('moment');

    module.exports = {
        updateOrCreateModelUserLog: updateOrCreateModelUserLog,
        getModelUserLog: getModelUserLog,
        deleteModelUserLog: deleteModelUserLog,
        deleteManyModelUserLogs: deleteManyModelUserLogs
    };

    function updateOrCreateModelUserLog(itemId, commentId, userId, VOTE_TYPE, COMMENTED, REPORTED) {
        var conditions = getCondition(itemId, commentId, userId),
            updates = getUpdates(VOTE_TYPE, COMMENTED, REPORTED),
            options = { upsert: true, new: true };
        return new Promise((resolve, reject) => {
            ModelUserLog.findOneAndUpdate(
                conditions,
                updates,
                options,
                (err, newModelUserLog) => {
                    if (err) { reject(err); }
                    resolve(newModelUserLog);
                }
            );
        });
    }

    // Get items with details
    async function getModelUserLog(itemId, commentId, userId) {
        var conditions = getCondition(itemId, commentId, userId),
            projections = {};
        return new Promise((resolve, reject) => {
            ModelUserLog.findOne(
                conditions,
                projections,
                (err, modelUserLog) => {
                    if (err) { reject(err); }
                    resolve(modelUserLog);
                }
            );
        });
    }

    function deleteModelUserLog(itemId, commentId, userId) {
        var conditions = getCondition(itemId, commentId, userId);
        return new Promise((resolve, reject) => {
            ModelUserLog.deleteOne(conditions, (err, record) => {
                if (err) {
                    reject(err);
                }
                resolve(record);
            });
        });
    }

    function deleteManyModelUserLogs(itemId, commentId, userId) {
        var conditions = getCondition(itemId, commentId, userId);
        return new Promise((resolve, reject) => {
            ModelUserLog.deleteMany(conditions, (err, logs) => {
                if (err) {
                    reject(err);
                }
                resolve(logs.n);
            });
        });
    }

    function getCondition(itemId, commentId, userId) {
        var conditions = {}
        if (itemId) {
            conditions = { itemId: itemId }
        }
        if (commentId) {
            conditions["commentId"] = commentId;
        }
        if (userId) {
            conditions["userId"] = userId;
        }
        return conditions;
    }

    function getUpdates(VOTE_TYPE, COMMENTED, REPORTED) {
        var updates = {};
        if (VOTE_TYPE !== null && VOTE_TYPE !== undefined) {
            updates = Object.assign(updates, {
                hasVoted: VOTE_TYPE,
                votedDate: moment().format("YYYY-MM-DD")
            });
        }
        if (COMMENTED) {
            updates = Object.assign(updates, {
                commented: COMMENTED,
                commentedDate: moment().format("YYYY-MM-DD")
            });
        }
        if (REPORTED) {
            updates = Object.assign(updates, {
                reported: REPORTED,
                reportedDate: moment().format("YYYY-MM-DD")
            });
        }
        return updates;
    }
}())