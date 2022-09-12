(function () {
  var Item = require("../model/item"),
    Comment = require("../model/comment"),
    modelUserLogSvc = require("./modelUserLogSvc"),
    reportSvc = require("./reportSvc"),
    fileSvc = require("./fileSvc");

  module.exports = {
    getItems: getItems,
    addItem: addItem,
    updateItem: updateItem,
    getItemByIdAndIncreaseView: getItemByIdAndIncreaseView,
    deleteItem: deleteItem,
    adjustNoOfCommentsOfItem: adjustNoOfCommentsOfItem,
    deleteAllCommentsOfItem: deleteAllCommentsOfItem,
    updateItemsOfAnUser: updateItemsOfAnUser,
    getOneItem: getOneItem,
    fakeDeleteItem: fakeDeleteItem,
    isExpired: isExpired,
    isRefundable: isRefundable,
    getRandomItems: getRandomItems
  };

  function isExpired(item) {
    const date1 = new Date();
    const date2 = new Date(item.modifiedDate);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > item.duration * 31) {
      return true;
    }
    return false;
  }

  function isRefundable(item) {
    if(item.duration === 0.5) {
      return false;
    }
    const date1 = new Date();
    const date2 = new Date(item.modifiedDate);
    const diffTime = Math.abs(date2 - date1);
    const diffHrs = diffTime / (1000 * 60 * 60);
    if (diffHrs > 1) {
      return false;
    } else {
      return true;
    }
  }

  /* Get items */
  function getItems(options) {
    return new Promise((resolve, reject) => {
      Item.find(options.conditions, {}, (err, items) => {
        if (err) {
          return reject(err);
        }
        return resolve(items);
      })
        .hint({ $natural: -1 })
        .skip(options.page * options.perPage)
        .limit(options.perPage);
    });
  }

  function getOneItem(conditions) {
    return new Promise((resolve, reject) => {
      Item.findOne(conditions, (err, item) => {
        if (err) {
          return reject(err);
        }
        return resolve(item);
      });
    });
  }

  function getRandomItems(conditions) {
    return new Promise((resolve, reject) => {
      Item.aggregate()
      .match(conditions)
      .sample(50)
      .exec((err, items) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(items)
        }
      });
    });
  }

  function getItemByIdAndIncreaseView(item) {
    return updateItem(
      item,
      { $inc: { noOfViews: 1 } },
      { upsert: true, new: true }
    );
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
            fileSvc.deleteFile(
              deletedItem.files[i].filename,
              deletedItem.files[i].fileType
            );
          }
          modelUserLogSvc.deleteManyModelUserLogs(deletedItem._id, null, null);
          reportSvc.deleteAllReportsInsideAnItem(deletedItem._id);
          return resolve(deletedItem);
        }
      });
    });
  }

  function fakeDeleteItem(conditions) {
    return new Promise((resolve, reject) => {
      Item.findOneAndUpdate(
        conditions,
        { status: "DELETED" },
        { new: true },
        (err, newItem) => {
          if (err) {
            return reject(err);
          }
          return resolve(newItem);
        }
      );
    });
  }

  function adjustNoOfCommentsOfItem(itemId, change) {
    updateItem(
      { _id: itemId },
      { $inc: { noOfComments: change } },
      { upsert: true, new: true }
    );
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
          "createdBy.avatar": newUserInfo.avatar,
        },
        (err, updatedItems) => {
          if (err) {
            return reject(err);
          }
          return resolve(updatedItems);
        }
      );
    });
  }
})();
