(function () {
    var Comment = require('../model/comment'),
        modelUserLogSvc = require('./modelUserLogSvc'),
        itemSvc = require('./itemSvc'),
        notificationSvc = require('./notificationSvc'),
        moment = require('moment'),
        ActionType = require('../shared/actionType');

    module.exports = {
        getComments: getComments,
        getCommentById: getCommentById,
        addComment: addComment,
        updateComment: updateComment,
        deleteComment: deleteComment,
        upvote: upvote,
        unvote: unvote,
        downvote: downvote,
        adjustNoOfRepliesOfComment: adjustNoOfRepliesOfComment,
        updateCommentsOfAnUser: updateCommentsOfAnUser
    };

    async function upvote(itemId, commentId, userId) {
        var adjustPoint = ActionType.NO_VOTE + 1,
            modelUserLog = await modelUserLogSvc.getModelUserLog(itemId, commentId, userId);
        if (modelUserLog) {
            if (modelUserLog.hasVoted === ActionType.UPVOTED) {
                adjustPoint = 0;
            } else if (modelUserLog.hasVoted === ActionType.DOWNVOTED) {
                adjustPoint = ActionType.NO_VOTE + 2;
            }
        }
        modelUserLogSvc.updateOrCreateModelUserLog(itemId, commentId, userId, ActionType.UPVOTED, null, null);
        let newItem = await updatePoint(itemId, commentId, adjustPoint);
        _createVoteNotification(itemId, commentId, newItem, "upvoted");
        return newItem;
    }

    async function unvote(itemId, commentId, userId) {
        let modelUserLog = await modelUserLogSvc.getModelUserLog(itemId, commentId, userId);
        if (modelUserLog) {
            var adjustPoint = ActionType.NO_VOTE - 1;
            if (modelUserLog.hasVoted === ActionType.NO_VOTE) {
                adjustPoint = 0;
            } else if (modelUserLog.hasVoted === ActionType.DOWNVOTED) {
                adjustPoint = ActionType.NO_VOTE + 1;
            }
            modelUserLogSvc.updateOrCreateModelUserLog(itemId, commentId, userId, ActionType.NO_VOTE, null, null);
            let newItem = await updatePoint(itemId, commentId, adjustPoint);
            return newItem;
        } else {
            return null;
        }
    }

    async function downvote(itemId, commentId, userId) {
        var adjustPoint = ActionType.NO_VOTE - 1,
            modelUserLog = await modelUserLogSvc.getModelUserLog(itemId, commentId, userId);
        if (modelUserLog) {
            if (modelUserLog.hasVoted === ActionType.DOWNVOTED) {
                adjustPoint = 0;
            } else if (modelUserLog.hasVoted === ActionType.UPVOTED) {
                adjustPoint = ActionType.NO_VOTE - 2;
            }
        }
        modelUserLogSvc.updateOrCreateModelUserLog(itemId, commentId, userId, ActionType.DOWNVOTED, null, null);
        let newItem = await updatePoint(itemId, commentId, adjustPoint);
        _createVoteNotification(itemId, commentId, newItem, "downvoted");
        return newItem;
    }

    function _createVoteNotification(itemId, commentId, newItem, vote) {
        var notification = {
            title: (commentId ? "Comment" : "Item") + " " + vote + ".",
            message: (commentId ? "Comment" : "Item") + " has " + newItem.noOfPoints + " points.",
            userId: (commentId ? newItem.writtenBy.userId : newItem.createdBy.userId),
            itemId: itemId,
            commentId: commentId,
            notifiedDate: moment().format("YYYY-MM-DD HH:mm Z"),
            hasRead: false
        }
        notificationSvc.createNotification(notification);
    }

    async function addComment(parentCommentId, comment) {
        let newComment = await _addComment(comment);
        if (newComment) {
            if (parentCommentId) {
                adjustNoOfRepliesOfComment(parentCommentId, 1);
            }
            modelUserLogSvc.updateOrCreateModelUserLog(newComment.itemId, newComment._id, newComment.writtenBy.userId, null, ActionType.COMMENTED, null);
            itemSvc.adjustNoOfCommentsOfItem(comment.itemId, 1);
            return newComment;
        } else {
            return null;
        }
    }

    function _addComment(comment) {
        return new Promise((resolve, reject) => {
            Comment.create(comment, (err, newComment) => {
                if (err) {
                    reject(err);
                }
                resolve(newComment);
            });
        });
    }

    function updatePoint(itemId, commentId, adjustPoint) {
        if (itemId) {
            if (commentId) {
                return updateComment(
                    { _id: commentId },
                    { $inc: { noOfPoints: adjustPoint } },
                    {
                        projection:
                        {
                            "noOfPoints": true,
                            "writtenBy": true
                        },
                        new: true
                    });
            }
            return itemSvc.updateItem(
                { _id: itemId },
                { $inc: { noOfPoints: adjustPoint } },
                {
                    projection: {
                        "noOfPoints": true,
                        "createdBy": true
                    },
                    new: true
                });
        }
        return null;
    }

    // Get replies of a comment
    function getComments(options, user) {
        return new Promise((resolve, reject) => {
            Comment.find(options.conditions, (err, comments) => {
                if (err) {
                    reject(err);
                }
                if (user) {
                    getWhatUserDidToTheseComment(comments, user.id).then(mappedComments => {
                        return resolve(mappedComments);
                    }).catch(errr => {
                        reject(errr);
                    });
                } else {
                    resolve(comments);
                }
            }).sort(options.order).skip(options.page * options.perPage).limit(options.perPage);
        });
    }

    function getCommentById(commentId) {
        return new Promise((resolve, reject) => {
            Comment.findById(commentId, (err, comment) => {
                if (err) {
                    reject(err)
                }
                resolve(comment);
            })
        });
    }

    function getWhatUserDidToTheseComment(comments, userId) {
        var newComments = comments.map(async (comment) => {
            var modelUserLog = await modelUserLogSvc.getModelUserLog(comment.itemId, comment._id, userId);
            if (modelUserLog) {
                if (modelUserLog.hasVoted === ActionType.DOWNVOTED) {
                    comment.hasDownvoted = true;
                }
                else if (modelUserLog.hasVoted === ActionType.UPVOTED) {
                    comment.hasUpvoted = true;
                }
                if (modelUserLog.itemId === comment.itemId && modelUserLog.commentId === comment._id && modelUserLog.reported === ActionType.REPORTED) {
                    comment.hasReported = true;
                }
            }
            return comment;
        });
        return Promise.all(newComments);
    }

    function updateComment(conditions, updates, options) {
        return new Promise((resolve, reject) => {
            Comment.findOneAndUpdate(conditions, updates, options, (err, newComment) => {
                if (err) {
                    reject(err);
                }
                if (updates.content) {
                    Comment.updateMany({
                        "replyTo._id": conditions._id
                    }, {
                        "replyTo.content": updates.content
                    }, options, (err, updates) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                resolve(newComment);
            });
        });
    }

    /** Delete one comment */
    function deleteComment(comment) {
        return new Promise((resolve, reject) => {
            Comment.findOneAndDelete(comment, (err, deletedComment) => {
                if (err) {
                    reject(err);
                }
                if (deletedComment) {
                    modelUserLogSvc.deleteManyModelUserLogs(deletedComment.itemId, deletedComment._id, null);
                    if (deletedComment.parentCommentId) {
                        itemSvc.adjustNoOfCommentsOfItem(deletedComment.itemId, -1);
                        adjustNoOfRepliesOfComment(deletedComment.parentCommentId, -1)
                            .then(updatedParentCom => {
                                return resolve(updatedParentCom);
                            }).catch(err => {
                                reject(err);
                            });
                    } else {
                        itemSvc.adjustNoOfCommentsOfItem(deletedComment.itemId, -(1 + deletedComment.noOfReplies));
                        resolve(deletedComment);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }

    function adjustNoOfRepliesOfComment(commentId, change) {
        return updateComment({ _id: commentId }, { $inc: { noOfReplies: change } }, { upsert: true, new: true })
    }

    function updateCommentsOfAnUser(newUserInfo) {
        return new Promise((resolve, reject) => {
            Comment.updateMany(
                { "writtenBy.userId": newUserInfo.id },
                {
                    "writtenBy.username": newUserInfo.username,
                    "writtenBy.avatar": newUserInfo.avatar
                }, (err, updatedComments) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(updatedComments)
                });
        })
    }
}());