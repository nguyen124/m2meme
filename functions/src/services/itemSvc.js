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
        updateItemsOfAnUser: updateItemsOfAnUser,
        getOneItem: getOneItem
    };

    /* Get items */
    function getItems(options) {
        return new Promise((resolve, reject) => {
            Item.find(options.conditions, {}, (err, items) => {
                if (err) {
                    return reject(err);
                }
                return resolve(items);
            }).sort(options.order).skip(options.page * options.perPage).limit(options.perPage);
        });
    }

    function getOneItem(options) {
        return new Promise((resolve, reject) => {
            Item.findOne(options.conditions, {}, (err, item) => {
                if (err) {
                    return reject(err);
                }
                return resolve(item);
            });
        });
    }

    function getItemById(item) {
        return updateItem(item, { $inc: { noOfViews: 1 } }, { upsert: true, new: true });
    }

    /** Add item */
    function addItem(item) {
        return new Promise((resolve, reject) => {
            Item.create(item, (err, item) => {
                if (err) {
                    return reject(err);
                }
                return resolve(item);
            });
        });
    }

    /** Update item */
    function updateItem(conditions, newInfo, options) {
        return new Promise((resolve, reject) => {
            Item.findOneAndUpdate(conditions, newInfo, options, (err, newItem) => {
                if (err) {
                    return reject(err);
                }
                return resolve(newItem);
            });
        });
    }

    /** Delete item */
    function deleteItem(item) {
        return new Promise((resolve, reject) => {
            Item.findOneAndDelete(item, (err, deletedItem) => {
                if (err || !deletedItem) {
                    return reject(err);
                } else {
                    deleteAllCommentsOfItem(deletedItem._id);
                    for (let i = 0; i < deletedItem.files.length; i++) {
                        fileSvc.deleteFile(deletedItem.files[i].filename, deletedItem.files[i].fileType);
                    }
                    modelUserLogSvc.deleteManyModelUserLogs(deletedItem._id, null, null);
                    reportSvc.deleteAllReportsInsideAnItem(deletedItem._id);
                    return resolve(deletedItem);
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
                    return reject(err);
                }
                return resolve(deletedComments);
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
                        return reject(err);
                    }
                    return resolve(updatedItems);
                });
        });
    }
}());