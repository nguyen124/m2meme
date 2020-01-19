(function () {
    var router = require('express').Router(),
        commentSvc = require('../services/commentSvc'),
        middleware = require('../../util/middleware'),
        moment = require('moment'),
        status = require('http-status');

    /*
    Service to upvote an item
    */
    router.put('/svc/current-user/upvote', middleware.isValidUser, (req, res) => {
        var itemId = req.body.itemId,
            commentId = req.body.commentId;
        commentSvc.upvote(itemId, commentId, req.user.id).then(newItem => {
            return res.status(status.OK).json(newItem.noOfPoints);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /*
    Service to unUpvote an item
    */
    router.put('/svc/current-user/unvote', middleware.isValidUser, (req, res) => {
        var itemId = req.body.itemId,
            commentId = req.body.commentId;
        commentSvc.unvote(itemId, commentId, req.user.id).then(newItem => {
            return res.status(status.OK).json(newItem.noOfPoints);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /*
    Service to downVote an item
    */
    router.put('/svc/current-user/downvote', middleware.isValidUser, (req, res) => {
        var itemId = req.body.itemId,
            commentId = req.body.commentId;
        commentSvc.downvote(itemId, commentId, req.user.id).then(newItem => {
            return res.status(status.OK).json(newItem.noOfPoints);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /*
    Service to comment over an item
    */
    router.post('/svc/current-user/comment', middleware.isValidUser, (req, res) => {
        var comment = req.body,
            parentCommentId = req.body.parentCommentId;
        comment.noOfPoints = 0;
        comment.noOfReplies = 0;
        comment.modifiedDate = moment().format("YYYY-MM-DD");
        comment.writtenBy = {
            userId: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar
        };

        commentSvc.addComment(parentCommentId, comment).then(newComment => {
            return res.status(status.OK).json(newComment);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /* Edit comment */
    router.put('/svc/items/:itemId/comments/:commentId', middleware.isValidUser, (req, res) => {
        var comment = req.body;
        var info = {
            comment: {
                _id: req.params.commentId,
                itemId: req.params.itemId
            },
            updates: comment,
            options: { new: true }
        };
        commentSvc.updateComment(info.comment, info.updates, info.options).then((result) => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /*Delete comment*/
    router.delete('/svc/items/:itemId/comments/:commentId', middleware.isValidUser, (req, res) => {
        var comment = {
            _id: req.params.commentId,
            itemId: req.params.itemId,
            "writtenBy.userId": req.user.id
        };
        commentSvc.deleteComment(comment).then((result) => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /*
    Service to get all comment of an item
    */
    router.get('/svc/items/:_itemId/comments', (req, res) => {
        var options = getOptions(req, { itemId: req.params._itemId });
        commentSvc.getComments(options, req.user).then((comments) => {
            return res.status(status.OK).json(comments);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    router.get('/svc/comments/:_commentId/replies', (req, res) => {
        var options = getOptions(req, { parentCommentId: req.params._commentId });
        commentSvc.getComments(options, req.user).then((comments) => {
            return res.status(status.OK).json(comments);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /** Get comment by id */
    router.get('/svc/comments/:id', (req, res) => {
        commentSvc.getCommentById(req.params.id).then((comment) => {
            return res.status(status.OK).json(comment);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    function getOptions(req, conditions) {
        var options = {
            page: getPageNo(req.query.page),
            perPage: getPerPageNo(req.query.perPage),
            order: { noOfPoints: -1 },
            conditions: conditions
        };
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
        return 10;
    }

    module.exports = router;
}());