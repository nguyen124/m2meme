(function () {
    var Item = require('../model/item'),
        Comment = require('../model/comment'),
        modelUserLogSvc = require('./modelUserLogSvc'),
        reportSvc = require('./reportSvc'),
        fileSvc = require('./fileSvc');

    module.exports = {
        getItems: getItems,
        addItem: addItem,
        updateItem: updateItem,
        getItemById: getItemById,
        deleteItem: deleteItem,
        adjustNoOfCommentsOfItem: adjustNoOfCommentsOfItem,
        deleteAllCommentsOfItem: deleteAllCommentsOfItem,
        updateItemsOfAnUser: updateItemsOfAnUser
    };

    /* Get items */
    function getItems(options) {
        return new Promise((resolve, reject) => {
            Item.find(options.conditions, {}, (err, items) => {
                if (err) {
                    reject(err);
                }
                resolve(items);
            }).sort(options.order).skip(options.page * options.perPage).limit(options.perPage);
        });
    }

    /** Add item */
    function addItem(item) {
        return new Promise((resolve, reject) => {
            Item.create(item, (err, item) => {
                if (err) {
                    reject(err);
                }
                resolve(item);
            });
        });
    }

    /** Update item */
    function updateItem(conditions, newInfo, options) {
        return new Promise((resolve, reject) => {
            Item.findOneAndUpdate(conditions, newInfo, options, (err, newItem) => {
                if (err) {
                    reject(err);
                }
                resolve(newItem);
            });
        });
    }

    function getItemById(item) {
        return new Promise((resolve, reject) => {
            Item.findById(item, (err, foundItem) => {
                if (err) {
                    reject(err);
                }
                resolve(foundItem);
            });
        });
    }

    /** Delete item */
    function deleteItem(item) {
        return new Promise((resolve, reject) => {
            Item.findOneAndDelete(item, (err, deletedItem) => {
                if (err || !deletedItem) {
                    reject(err);
                } else {
                    deleteAllCommentsOfItem(deletedItem._id);
                    fileSvc.deleteFile(deletedItem.filename);
                    modelUserLogSvc.deleteManyModelUserLogs(deletedItem._id, null, null);
                    reportSvc.deleteAllReportsInsideAnItem(deletedItem._id);
                    resolve(deletedItem);
                }
            });
        });
    }

    function adjustNoOfCommentsOfItem(itemId, change) {
        updateItem({ _id: itemId }, { $inc: { noOfComments: change } }, { upsert: true, new: true });
    }

    /**Delete all comments in an item */

    function deleteAllCommentsOfItem(itemId) {
        return new Promise((resolve, reject) => {
            Comment.deleteMany({ itemId: itemId }, (err, deletedComments) => {
                if (err) {
                    reject(err);
                }
                resolve(deletedComments);
            });
        });
    }

    function updateItemsOfAnUser(newUserInfo) {
        return new Promise((resolve, reject) => {
            Item.updateMany(
                { "createdBy.userId": newUserInfo.id },
                {
                    "createdBy.username": newUserInfo.username,
                    "createdBy.avatar": newUserInfo.avatar
                }, (err, updatedItems) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(updatedItems);
                });
        });
    }
}());