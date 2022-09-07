(function () {
  var router = require("express").Router(),
    middleware = require("../../util/middleware"),
    status = require("http-status"),
    paymentSvc = require("../services/paymentSvc");

  /*
    Service to get reports 
    */
  router.post("/svc/stripe/checkout", middleware.isValidUser, (req, res) => {
    //console.log(req.body);
    let duration = req.body.duration;
    let appliedCoupon = req.body.appliedCoupon;
    let token = req.body.stripeToken;
    let userId = req.user.id;
    
    paymentSvc
      .checkout(duration, appliedCoupon, token, userId)
      .then((result) => {
        return res.status(status.OK).json(result);
      })
      .catch((err) => {
        return res.status(status.INTERNAL_SERVER_ERROR).json(err);
      });
  });

  router.post("/svc/stripe/refund", middleware.isValidUser, (req, res) => {
    let chargeId = req.body.chargeId;
    paymentSvc
      .refund(chargeId, req.user.id)
      .then((result) => {
        return res.status(status.OK).json(result);
      })
      .catch((err) => {
        return res.status(status.INTERNAL_SERVER_ERROR).json(err);
      });
  });
  module.exports = router;
})();
