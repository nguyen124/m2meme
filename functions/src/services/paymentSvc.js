(function () {
  var Payment = require("../model/payment"),
    Refund = require("../model/refund"),
    itemSvc = require("../services/itemSvc"),
    moment = require("moment");
  const environment =
    require("../../env.json")[process.env.NODE_ENV || "development"];
  const stripe = require("stripe")(environment.stripeSk);

  module.exports = {
    savePayment: savePayment,
    saveRefund: saveRefund,
    checkout: checkout,
    refund: refund,
  };

  function savePayment(payment) {
    return new Promise((resolve, reject) => {
      Payment.create(payment, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  function saveRefund(refund) {
    return new Promise((resolve, reject) => {
      Refund.create(refund, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  function checkout(duration, stripeToken, userId) {
    return new Promise((resolve, reject) => {
      let cost = 0;
      let description = "";
      if (!duration || isNaN(duration)) {
        reject({
          status: "failure",
          message: "Not valid input",
        });
        return;
      }
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
      const customer = stripe.customers
        .create({
          email: stripeToken.email,
          source: stripeToken.id,
        })
        .then((customer) => {
          return stripe.charges.create({
            amount: cost * 100,
            description: description,
            currency: "USD",
            customer: customer.id,
            receipt_email: stripeToken.email,
          });
        })
        .then((charge) => {
          savePayment({
            userId: userId,
            charge,
            modifiedDate: moment().format(),
          });
          resolve({
            status: "success",
            charge: {
              id: charge.id,
              amount: charge.amount,
              description: charge.description,
              created: charge.created,
            },
          });
        })
        .catch((err) => {
          reject({
            status: "failure",
          });
        });
    });
  }

  function refund(chargeId, userId) {
    return new Promise((resolve, reject) => {
      stripe.refunds
        .create({
          charge: chargeId,
        })
        .then((refund) => {
          saveRefund({
            userId: userId,
            refund,
            modifiedDate: moment().format(),
          });
          itemSvc
            .updateItem(
              {
                "charge.id": chargeId,
              },
              { $set: { status: "REFUNDED" } },
              { new: true }
            )
            .then((result) => {
              resolve({
                status: "success",
                result
              });
            })
            .catch((err) => {
              reject({
                status: "failure",
                err: err,
              });
            });
        });
    });
  }
})();
