(function () {
  var mongoose = require("mongoose"),
    couponSchema = mongoose.Schema({
      code: {
        type: String,
        maxlength: 30,
      },
      percentage: Number,
      expiredDate: Date,
      redeemedTimes: Number,
      maxRedeemedTimes: Number,
      modifiedDate: {
        type: Date,
        expires: 31556952,
      },
    });
  couponSchema.index({ modifiedDate: -1, tags: 1 });
  //TTL of modifiedDate.
  //157680000 is 5years , 94608000 is 3 years, 63072000 is 2 years , 34190000 is 13 months
  module.exports = mongoose.model("coupon", couponSchema);
})();
