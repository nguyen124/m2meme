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

  function checkout(duration, appliedCoupon, stripeToken, userId) {
    return new Promise((resolve, reject) => {
      let cost = 0;
      let price = 20;
      let description = "";
      if (!duration || isNaN(duration)) {
        return;
      }
      if (appliedCoupon) {
        price = price / 2;
      }
      switch (duration) {
        case "1":
          cost = price;
          description = "Tạo Quảng Cáo Cho 1 Tháng";
          break;
        case "3":
          cost = price * 2;
          description = "Tạo Quảng Cáo Cho 3 Tháng";
          break;
        case "6":
          cost = price * 3;
          description = "Tạo Quảng Cáo Cho 6 Tháng";
          break;
        //duration
        case "24":
          cost = price * 4;
          description = "Tạo Quảng Cáo Cho 24 Tháng";
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
        .then(async (charge) => {
          await savePayment({
            userId: userId,
            charge,
            modifiedDate: moment().format(),
          });
          return resolve({
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
          // console.log("Save payment in checkout err: ");
          // console.log(err);
          reject(err);
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
          return saveRefund({
            userId: userId,
            refund,
            modifiedDate: moment().format(),
          });
        })
        .then((result) => {
          return itemSvc.updateItem(
            {
              "charge.id": chargeId,
            },
            { $set: { status: "REFUNDED" } },
            { new: true }
          );
        })
        .then((result) => {
          return resolve({
            status: "success",
            result,
          });
        })
        .catch((err) => {
          // console.log("Error in save refund");
          // console.log(err);
          reject(err);
        });
    });
  }
})();
