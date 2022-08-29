(function () {
  var router = require("express").Router(),
    itemSvc = require("../services/itemSvc"),
    commentSvc = require("../services/commentSvc"),
    middleware = require("../../util/middleware"),
    modelUserLogSvc = require("../services/modelUserLogSvc"),
    sharedSvc = require("../shared/utilSvc"),
    status = require("http-status"),
    moment = require("moment"),
    ActionType = require("../shared/actionType");
  const paymentSvc = require("../services/paymentSvc");

  //const environment = require("../../env.json")[process.env.NODE_ENV || "development"];
  //const stripe = require("stripe")(environment.stripeSk);

  //********************ITEM*********************** */
  router.get("/svc/business", (req, res, next) => {
    var options = getOptions(req);
    options.conditions = Object.assign(options.conditions, {
      expired: { $ne: true },
    });
    itemSvc
      .getItems(options)
      .then((items) => {
        return processItems(req, res, items);
      })
      .catch((err) => {
        return res.status(status.INTERNAL_SERVER_ERROR).json(err);
      });
  });

  router.get("/svc/business/user/", (req, res, next) => {
    var options = getOptions(req);
    itemSvc
      .getItems(options)
      .then((items) => {
        return processMyItems(req, res, items);
      })
      .catch((err) => {
        return res.status(status.INTERNAL_SERVER_ERROR).json(err);
      });
  });

  function processItems(req, res, items) {
    var newItems = null;
    if (req.user) {
      newItems = items
        .filter((item) => {
          //filter out expired items
          return item.status !== "REFUNDED" && !itemSvc.isExpired(item);
        })
        .map(async (item) => {
          item.refundable = itemSvc.isRefundable(item);
          var modelUserLog = await modelUserLogSvc.getModelUserLog(
            item._id,
            null,
            req.user.id
          );
          if (modelUserLog) {
            if (modelUserLog.hasVoted === ActionType.UPVOTED) {
              item.hasUpvoted = true;
            }
            if (
              modelUserLog.itemId === item.id &&
              !modelUserLog.commentId &&
              modelUserLog.reported === ActionType.REPORTED
            ) {
              item.hasReported = true;
            }
          }
          return item;
        });
    }
    Promise.all(newItems || items)
      .then((result) => {
        return res.status(status.OK).json(result);
      })
      .catch((err) => {
        return res.status(status.NOT_IMPLEMENTED).json(err);
      });
  }

  function processMyItems(req, res, items) {
    var newItems = null;
    if (req.user) {
      newItems = items.map(async (item) => {
        item.expired = itemSvc.isExpired(item);
        item.refundable = itemSvc.isRefundable(item);
        var modelUserLog = await modelUserLogSvc.getModelUserLog(
          item._id,
          null,
          req.user.id
        );
        if (modelUserLog) {
          if (modelUserLog.hasVoted === ActionType.UPVOTED) {
            item.hasUpvoted = true;
          }
          if (
            modelUserLog.itemId === item.id &&
            !modelUserLog.commentId &&
            modelUserLog.reported === ActionType.REPORTED
          ) {
            item.hasReported = true;
          }
        }
        return item;
      });
    }
    Promise.all(newItems || items)
      .then((result) => {
        return res.status(status.OK).json(result);
      })
      .catch((err) => {
        return res.status(status.NOT_IMPLEMENTED).json(err);
      });
  }

  /** Get item */
  router.post("/svc/business/:id/upview", (req, res) => {
    var condition = {
      _id: req.params.id,
    };
    itemSvc
      .getItemByIdAndIncreaseView(condition)
      .then((item) => {
        return processOne(req, res, item);
      })
      .then((result) => {
        return res.status(status.OK).json(result);
      })
      .catch((err) => {
        return res.status(status.INTERNAL_SERVER_ERROR).json(err);
      });
  });

  /** Get item */
  router.get("/svc/business/:id", (req, res) => {
    var item = {
      _id: req.params.id,
    };
    itemSvc
      .getOneItem(item)
      .then((item) => {
        return item;
      })
      .then((result) => {
        return res.status(status.OK).json(result);
      })
      .catch((err) => {
        return res.status(status.INTERNAL_SERVER_ERROR).json(err);
      });
  });

  async function processOne(req, res, item) {
    if (req.user) {
      var modelUserLog = await modelUserLogSvc.getModelUserLog(
        item._id,
        null,
        req.user.id
      );
      if (modelUserLog) {
        if (modelUserLog.hasVoted === ActionType.UPVOTED) {
          item.hasUpvoted = true;
        }
        if (
          modelUserLog.itemId === item.id &&
          !modelUserLog.commentId &&
          modelUserLog.reported === ActionType.REPORTED
        ) {
          item.hasReported = true;
        }
      }
    }
    return item;
  }

  /** Delete item NO EXPOSED TO CLIENT YET*/
  // router.delete(
  //   "/svc/business/:id/delete",
  //   middleware.isValidUser,
  //   (req, res) => {
  //     var conditions = {
  //       _id: req.params.id,
  //     };
  //     if (req.user.role !== "ADMIN") {
  //       conditions = Object.assign(conditions, {
  //         "createdBy.userId": req.user.id,
  //       });
  //     }
  //     itemSvc
  //       .deleteItem(conditions)
  //       .then((result) => {
  //         return res.status(status.OK).json(result);
  //       })
  //       .catch((err) => {
  //         return res.status(status.INTERNAL_SERVER_ERROR).json(err);
  //       });
  //   }
  // );

  router.put(
    "/svc/business/:id/fakedelete",
    middleware.isValidUser,
    (req, res) => {
      var conditions = {
        _id: req.params.id,
      };
      if (req.user.role !== "ADMIN") {
        conditions = Object.assign(conditions, {
          "createdBy.userId": req.user.id,
        });
      }
      itemSvc
        .fakeDeleteItem(conditions)
        .then((result) => {
          return res.status(status.OK).json(result);
        })
        .catch((err) => {
          return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
    }
  );

  router.put(
    "/svc/business/:id/deleteRefund",
    middleware.isValidUser,
    (req, res) => {
      var conditions = {
        _id: req.params.id,
      };
      itemSvc
        .getOneItem(conditions)
        .then((item) => {
          if (itemSvc.isRefundable(item)) {
            return paymentSvc.refund(item.charge.id, req.user.id);
          }
          return Promise.reject(new Error("Not refundable"));
        })
        .then((result) => {
          return res.status(status.OK).json(result);
        })
        .catch((err) => {
          return res.status(status.INTERNAL_SERVER_ERROR).json(err);
        });
    }
  );

  function getOptions(req, conditions) {
    var options = {
      page: sharedSvc.getPageNo(req.query.page, 0),
      perPage: sharedSvc.getPageNo(req.query.perPage, 40),
      temp: req.query.temp || "",
      order: { modifiedDate: -1 },
      conditions: conditions || {},
    };
    options.conditions = Object.assign(options.conditions, {
      status: { $ne: "DELETED" },
    });

    var tag = req.query.tag,
      date = req.query.date,
      createdBy = req.query.createdBy,
      category = req.query.category,
      need = req.query.need,
      id = req.query.id,
      //temp = req.query.temp,
      address = req.query.address,
      zipcode = req.query.zipcode,
      city = req.query.city,
      state = req.query.state,
      country = req.query.country,
      minPrice = req.query.minPrice,
      maxPrice = req.query.maxPrice,
      keyword = req.query.keyword;

    // query conditions
    if (category) {
      options.conditions = Object.assign(options.conditions, {
        categories: { $in: [category] },
      });
    }
    if (need) {
      if (need !== "other") {
        options.conditions = Object.assign(options.conditions, {
          needs: { $in: [need] },
        });
      } else {
        options.conditions = Object.assign(options.conditions, {
          needs: { $nin: ["forSale", "hiring"] },
        });
      }
    }
    if (tag) {
      options.conditions = Object.assign(options.conditions, {
        tags: { $in: [tag] },
      });
    }
    if (date) {
      options.conditions = Object.assign(options.conditions, {
        modifiedDate: date,
      });
    }
    if (createdBy) {
      options.conditions = Object.assign(options.conditions, {
        "createdBy.userId": createdBy,
      });
    }
    if (id) {
      options.conditions = Object.assign(options.conditions, { _id: id });
    }
    if (address || zipcode || city || state || country) {
      options.conditions = Object.assign(
        options.conditions,
        address ? { address } : null,
        zipcode ? { zipcode } : null,
        city ? { city } : null,
        state ? { state } : null,
        country ? { country } : null
      );
    }
    if (minPrice) {
      options.conditions = Object.assign(options.conditions, {
        price: { $gte: minPrice },
      });
    }
    if (maxPrice) {
      options.conditions = Object.assign(options.conditions, {
        price: { $lte: maxPrice },
      });
    }
    if (keyword) {
      options.conditions = Object.assign(options.conditions, {
        $or: [
          { title: { $regex: keyword } },
          { businessName: { $regex: keyword } },
          { tags: { $in: [keyword] } },
        ],
      });
    }
    return options;
  }

  /*
    Service to update an item
    */
  router.put("/svc/business/:id/update", (req, res) => {
    var newItemInfo = req.body;
    //prevent user chaning modifiedDate
    delete newItemInfo.modifiedDate;
    itemSvc
      .updateItem(
        { _id: req.params.id, "createdBy.userId": req.user.id },
        newItemInfo,
        {}
      )
      .then((result) => {
        return res.status(status.OK).json(result);
      })
      .catch((err) => {
        res.status(status.INTERNAL_SERVER_ERROR).json(err);
      });
  });

  /*
    Service to create new item
    */
  router.post("/svc/business/create", middleware.isValidUser, (req, res) => {
    var item = req.body;
    var isValid = validate(req.user, item);
    if (!isValid) {
      return res.status(status.INTERNAL_SERVER_ERROR).json("Invalid form");
    }
    return itemSvc
      .addItem(item)
      .then((newItem) => {
        return res.status(status.OK).json(newItem);
      })
      .catch((err) => {
        // console.log("Business/create err: ");
        // console.log(err);
        return res.status(status.INTERNAL_SERVER_ERROR).json(err);
      });
  });

  /*
   Service to get all comment of an item
   */
  router.get("/svc/business/:_itemId/comments", (req, res) => {
    var options = getOptions(req, {
      itemId: req.params._itemId,
      parentCommentId: null,
    });
    options.order = { noOfPoints: -1 }; // overide default order
    commentSvc
      .getComments(options, req.user)
      .then((comments) => {
        return res.status(status.OK).json(comments);
      })
      .catch((err) => {
        return res.status(status.INTERNAL_SERVER_ERROR).json(err);
      });
  });

  function validate(user, item) {
    let charge = item.charge;
    // will turn this on if neccessary in future
    // stripe.charges.retrieve(charge.id).then(charge=>{
    // }).catch((err) => {
    //     console.log("Can't get charge by id");
    //     console.log(err);
    // });
    let duration = Number(item.duration);
    if (duration === 1 && charge.amount !== 2000) {
      return false;
    }
    if (duration === 3 && charge.amount !== 4000) {
      return false;
    }
    if (duration === 6 && charge.amount !== 6000) {
      return false;
    }
    if (duration === 12 && charge.amount !== 8000) {
      return false;
    }
    if (
      !item.files ||
      item.files.length > 10 ||
      item.files.length <= 0 ||
      (item.tags && item.tags.length > 5) ||
      (item.categories && item.categories.length > 20)
    ) {
      return false;
    }
    item.tags = item.tags.slice(0, 5);
    item.createdBy = {
      userId: user.id,
      avatar: user.avatar,
      username: user.username,
      rank: user.rank,
      noOfFollowers: user.noOfFollowers,
    };
    item.modifiedDate = moment().format();
    item.noOfPoints = 0;
    item.noOfSeens = 0;
    item.noOfShares = 0;
    item.noOfComments = 0;
    item.status = "NEW";
    return true;
  }

  module.exports = router;
})();
