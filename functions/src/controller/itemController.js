(function () {
    var router = require('express').Router(),
        itemSvc = require('../services/itemSvc'),
        middleware = require('../../util/middleware'),
        modelUserLogSvc = require('../services/modelUserLogSvc'),
        sharedSvc = require('../shared/utilSvc'),
        status = require('http-status'),
        moment = require('moment'),
        ActionType = require('../shared/actionType');

    //********************ITEM*********************** */
    router.get('/svc/items', (req, res, next) => {
        var options = getOptions(req);
        itemSvc.getItems(options).then((items) => {
            return process(req, res, items);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    function process(req, res, items) {
        var newItems = null;
        if (req.user) {
            newItems = items.map(async (item) => {
                var modelUserLog = await modelUserLogSvc.getModelUserLog(item._id, null, req.user.id);
                if (modelUserLog) {
                    if (modelUserLog.hasVoted === ActionType.DOWNVOTED) {
                        item.hasDownvoted = true;
                    } else if (modelUserLog.hasVoted === ActionType.UPVOTED) {
                        item.hasUpvoted = true;
                    }
                    if (modelUserLog.itemId === item._id && modelUserLog.commentId === null && modelUserLog.reported === ActionType.REPORTED) {
                        item.hasReported = true;
                    }
                }
                return item;
            });
        }
        Promise.all(newItems || items).then((result) => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    }

    /** Get item */
    router.get('/svc/items/:id', (req, res) => {
        var item = {
            _id: req.params.id
        };
        itemSvc.getItemById(item).then((item) => {
            return processOne(req, res, item);
        }).then(result => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    async function processOne(req, res, item) {
        if (req.user) {
            var modelUserLog = await modelUserLogSvc.getModelUserLog(item._id, null, req.user.id);
            if (modelUserLog) {
                if (modelUserLog.hasVoted === ActionType.DOWNVOTED) {
                    item.hasDownvoted = true;
                } else if (modelUserLog.hasVoted === ActionType.UPVOTED) {
                    item.hasUpvoted = true;
                }
                if (modelUserLog.itemId === item._id && modelUserLog.commentId === null && modelUserLog.reported === ActionType.REPORTED) {
                    item.hasReported = true;
                }
            }
        }
        return item;
    }

    /** Delete item */
    router.delete('/svc/items/:id', middleware.isValidUser, (req, res) => {
        var conditions = {
            _id: req.params.id
        };
        if (req.user.role !== "ADMIN") {
            conditions = Object.assign(conditions, { "createdBy.userId": req.user.id });
        }
        itemSvc.deleteItem(conditions).then((result) => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    function getOptions(req) {
        var options = {
            page: sharedSvc.getPageNo(req.query.page, 0),
            perPage: sharedSvc.getPageNo(req.query.perPage, 40),
            temp: req.query.temp || "",
            order: { modifiedDate: -1 },
            conditions: {}
        };

        var tag = req.query.tag,
            date = req.query.date,
            createdBy = req.query.createdBy,
            category = req.query.category,
            id = req.query.id,
            temp = req.query.temp;

        // query conditions
        if (category) {
            options.conditions = Object.assign(options.conditions, { categories: { $in: [category] } });
        }
        if (tag) {
            options.conditions = Object.assign(options.conditions, { tags: { $in: [tag] } });
        }
        if (date) {
            options.conditions = Object.assign(options.conditions, { modifiedDate: date })
        }
        if (createdBy) {
            options.conditions = Object.assign(options.conditions, { 'createdBy.userId': createdBy });
        }
        if (id) {
            options.conditions = Object.assign(options.conditions, { '_id': id });
        }
        if (temp) {
            if (options.temp === "cold") {
                options.conditions = Object.assign(options.conditions, { 'noOfPoints': { $lt: 1000 } });
            } else if (options.temp === "warm") {
                options.conditions = Object.assign(options.conditions, { 'noOfPoints': { $gte: 1000, $lt: 2000 } });
            } else if (options.temp === "hot") {
                options.conditions = Object.assign(options.conditions, { 'noOfPoints': { $gte: 2000 } });
            }
        }
        return options;
    }

    /*
    Service to update an item
    */
    router.put('/svc/items/:id', (req, res) => {
        var newItemInfo = req.body;
        itemSvc.updateItem({ _id: req.params.id }, newItemInfo, {}).then(result => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    /*
    Service to create new item
    */
    router.post('/svc/current-user/items', middleware.isValidUser, (req, res) => {
        var item = req.body;
        var isValid = validate(req.user, item);
        if (!isValid) {
            return res.status(status.NOT_IMPLEMENTED).json("Invalid form");
        }
        return itemSvc.addItem(item).then(newItem => {
            return res.status(status.OK).json(newItem);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    function validate(user, item) {
        if (!item.title || !item.files || (item.files.length <= 0)) {
            return false;
        }
        item.tags = item.tags.slice(0, 5);
        item.createdBy = {
            userId: user.id,
            avatar: user.avatar,
            username: user.username,
            rank: user.rank,
            noOfFollowers: user.noOfFollowers
        };
        item.modifiedDate = moment().format("YYYY-MM-DD");
        item.noOfPoints = 0;
        item.noOfSeens = 0;
        item.noOfShares = 0;
        item.noOfComments = 0;
        return true;
    }

    module.exports = router;
}());