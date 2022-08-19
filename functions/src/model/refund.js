(function () {
  var mongoose = require("mongoose"),
    refundSchema = mongoose.Schema({
      refund: Object,
      userId: {
        type: String,
        maxlength: 24,
      },
      modifiedDate: {
        type: Date,
        expires: 157680000,
      },
    });

  refundSchema.index({ modifiedDate: -1, tags: 1 });
  //TTL of modifiedDate.
  //157680000 is 5years , 94608000 is 3 years, 63072000 is 2 years , 34190000 is 13 months
  module.exports = mongoose.model("refund", refundSchema);
})();
