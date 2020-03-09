(function () {
    var router = require('express').Router(),
        itemSvc = require('../services/itemSvc'),
        middleware = require('../../util/middleware'),
        modelUserLogSvc = require('../services/modelUserLogSvc'),
        status = require('http-status'),
        moment = require('moment'),
        ActionType = require('../shared/actionType');

    //********************ITEM*********************** */
    router.get('/svc/items', (req, res, next) => {
        var options = getOptions(req);
        itemSvc.getItems(options).then((items) => {
            if (req.user) {
                if (options.temp) {
                    items = items.filter(item => {
                        if (options.temp === "cold") {
                            return item.noOfPoints < 1000;
                        } else if (options.temp === "warm") {
                            return item.noOfPoints >= 1000 && item.noOfPoints < 2000;
                        }
                        return item.noOfPoints >= 2000;
                    });
                }
                return process(req, res, next, items);
            }
            return res.status(status.OK).json(items);
        }).catch(err => {
            next(err);
        });
    });

    function process(req, res, next, items) {
        var newItems = items.map(async (item) => {
            var modelUserLog = await modelUserLogSvc.getModelUserLog(item._id, null, req.user.id);
            if (modelUserLog) {
                if (modelUserLog.hasVoted === ActionType.DOWNVOTED) {
                    item.hasDownvoted = true;
                }
                else if (modelUserLog.hasVoted === ActionType.UPVOTED) {
                    item.hasUpvoted = true;
                }
                if (modelUserLog.itemId === item._id && modelUserLog.commentId === null && modelUserLog.reported === ActionType.REPORTED) {
                    item.hasReported = true;
                }
            }
            return item;
        });
        Promise.all(newItems).then((result) => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            next(err);
        });
    }

    /** Get item */
    router.get('/svc/items/:id', (req, res) => {
        var item = {
            _id: req.params.id
        };
        itemSvc.getItemById(item).then((result) => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });


    /** Delete item */
    router.delete('/svc/items/:id', middleware.isValidUser, (req, res) => {
        var item = {
            _id: req.params.id,
            "createdBy.userId": req.user.id
        };
        itemSvc.deleteItem(item).then((result) => {
            return res.status(status.OK).json(result);
        }).catch(err => {
            return res.status(status.NOT_IMPLEMENTED).json(err);
        });
    });

    function getOptions(req) {
        var options = {
            page: getPageNo(req.query.nextPage),
            perPage: getPerPageNo(req.query.perPage),
            temp: req.query.temp || "",
            order: { modifiedDate: -1 },
            conditions: {}
        };

        var tag = req.query.tag,
            date = req.query.date,
            createdBy = req.query.createdBy,
            id = req.query.id;

        // query conditions
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
        return 4;
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
        if (!item.title || !item.url) {
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