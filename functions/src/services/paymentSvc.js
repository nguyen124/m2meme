(function () {
  var Payment = require("../model/payment");

  module.exports = {
    savePayment: savePayment,
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
})();
