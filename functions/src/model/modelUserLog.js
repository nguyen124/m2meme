(function () {
  var mongoose = require("mongoose"),
    moment = require("moment"),
    modelUserLogSchema = mongoose.Schema({
      userId: {
        type: String,
        maxlength: 24,
      },
      itemId: {
        type: String,
        maxlength: 24,
      },
      commentId: {
        type: String,
        maxlength: 24,
      },
      hasVoted: Number,
      votedDate: Date,
      commented: Number,
      commentedDate: Date,
      reported: Number,
      reportedDate: Date,
      modifiedDate: {
        type: Date,
        expires: 34190000,
      },
    });
  //TTL of modifiedDate.
  //157680000 is 5years , 94608000 is 3 years, 63072000 is 2 years , 34190000 is 13 months
  modelUserLogSchema.index({ userId: 1, itemId: 1, commentId: 1 });
  module.exports = mongoose.model("modeluserlog", modelUserLogSchema);
})();
