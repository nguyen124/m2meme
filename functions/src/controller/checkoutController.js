(function () {
  var router = require("express").Router(),
    middleware = require("../../util/middleware"),
    status = require("http-status");
  const environment =
    require("../../env.json")[process.env.NODE_ENV || "development"];

  const stripe = require("stripe")(environment.stripeSk);

  /*
    Service to get reports 
    */
  router.post("/svc/stripe/checkout", middleware.isValidUser, (req, res) => {
    console.log(req.body);
    let duration = req.body.duration;
    let cost = 0;
    let description = "";
    switch (duration) {
      case "1":
        cost = 20;
        description = "Tạo Quảng Cáo Cho 1 Tháng";
        break;
      case "3":
        cost = 40;
        description = "Tạo Quảng Cáo Cho 3 Tháng";
        break;
      case "6":
        cost = 60;
        description = "Tạo Quảng Cáo Cho 6 Tháng";
        break;
      case "12":
        cost = 80;
        description = "Tạo Quảng Cáo Cho 12 Tháng";
        break;
    }
    token = req.body.stripeToken;
    const customer = stripe.customers
      .create({
        email: token.email,
        source: token.id,
      })
      .then((customer) => {
        console.log(customer);
        return stripe.charges.create({
          amount: cost * 100,
          description: description,
          currency: "USD",
          customer: customer.id,
          receipt_email: token.email,
        });
      })
      .then((charge) => {
        console.log("Charge success: ");
        console.log(charge);
        return res.status(status.OK).json({
          status: "success",
          charge,
        });
      })
      .catch((err) => {
        console.log("Charge failure: ");
        console.log(err);
        return res.status(status.INTERNAL_SERVER_ERROR).json({
          status: "failure",
        });
      });
  });

  router.post("/svc/stripe/refund", middleware.isValidUser, (req, res) => {
    let chargeId = req.body.chargeId;
    stripe.refunds
      .create({
        charge: chargeId,
      })
      .then((refund) => {
        console.log("Refund success: ");
        console.log(refund);
        return res.status(status.OK).json({
          status: "success",
          refund,
        });
      })
      .catch((err) => {
        console.log("Refund failutre: ");
        console.log(err);
        return res.status(status.INTERNAL_SERVER_ERROR).json({
          status: "failure",
        });
      });
  });
  module.exports = router;
})();
