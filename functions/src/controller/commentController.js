(function () {
    var router = require('express').Router(),
        commentSvc = require('../services/commentSvc'),
        sharedSvc = require('../shared/utilSvc'),
        middleware = require('../../util/middleware'),
        moment = require('moment'),
        status = require('http-status');

    /*
    Service to upvote an item
    */
    router.put('/svc/comments/upvote', middleware.isValidUser, (req, res) => {
        var itemId = req.body.itemId,
            commentId = req.body.commentId;
        commentSvc.upvote(itemId, commentId, req.user.id).then(newItem => {
            return res.status(status.OK).json(newItem.noOfPoints);
        }).catch(err => {
            return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
    });

    /*
    Service to unUpvote an item
    */
    router.put('/svc/comments/unvote', middleware.isValidUser, (req, res) => {
        var itemId = req.body.itemId,
            commentId = req.body.commentId;
        commentSvc.unvote(itemId, commentId, req.user.id).then(newItem => {
            return res.status(status.OK).json(newItem.noOfPoints);
        }).catch(err => {
            return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
    });

    /*
    Service to downVote an item
    */
    router.put('/svc/comments/downvote', middleware.isValidUser, (req, res) => {
        var itemId = req.body.itemId,
            commentId = req.body.commentId;
        commentSvc.downvote(itemId, commentId, req.user.id).then(newItem => {
            return res.status(status.OK).json(newItem.noOfPoints);
        }).catch(err => {
            return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
    });

    /*
    Service to comment over an item
    */
    router.post('/svc/comments/create', middleware.isValidUser, (req, res) => {
        var comment = req.body,
            parentCommentId = req.body.parentCommentId;
        comment.noOfPoints = 0;
        comment.noOfReplies = 0;
        comment.modifiedDate = moment().format("YYYY-MM-DD HH:mm:ss Z");
        comment.writtenBy = {
            userId: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar
        };

        commentSvc.addComment(parentCommentId, comment).then(newComment => {
            return res.status(status.OK).json(newComment);
        }).catch(err => {
            return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
    });

    /* Edit comment */
    router.put('/svc/comments/:commentId/update', middleware.isValidUser, (req, res) => {
        var comment = req.body;
        var info = {
            comment: {
                _id: req.params.commentId,
                itemId: comment.itemId
            },
            updates: { content: comment.content },
            options: { new: true }
        };
        commentSvc.updateComment(info.comment, info.updates, info.options).then((result) => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
    });

    /*Delete comment*/
    router.delete('/svc/comments/:commentId/delete', middleware.isValidUser, (req, res) => {
        var conditions = {
            _id: req.params.commentId
        };
        if (req.user.role !== "ADMIN") {
            conditions = Object.assign(conditions, { "writtenBy.userId": req.user.id });
        }
        commentSvc.deleteComment(conditions).then((result) => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
    });

    router.get('/svc/comments/:_commentId/replies', (req, res) => {
        var options = getOptions(req, { parentCommentId: req.params._commentId });
        commentSvc.getComments(options, req.user).then((comments) => {
            return res.status(status.OK).json(comments);
        }).catch(err => {
            return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
    });

    /** Get comment by id */
    router.get('/svc/comments/:id', (req, res) => {
        commentSvc.getCommentById(req.params.id).then((comment) => {
            return res.status(status.OK).json(comment);
        }).catch(err => {
            return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
    });

    function getOptions(req, conditions) {
        var options = {
            page: sharedSvc.getPageNo(req.query.page, 0),
            perPage: sharedSvc.getPageNo(req.query.perPage, 10),
            order: { noOfPoints: -1 },
            conditions: conditions
        };
        return options;
    }

    module.exports = router;
}());