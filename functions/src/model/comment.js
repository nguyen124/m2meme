(function () {
  var mongoose = require("mongoose"),
    commentSchemma = mongoose.Schema({
      parentCommentId: {
        type: String,
        maxlength: 24,
      },
      content: [
        {
          url: {
            type: String,
            maxlength: 1024,
          },
          filename: {
            type: String,
            maxlength: 64,
          },
          fileType: {
            type: String,
            maxlength: 24,
          },
        },
      ],
      replyTo: Object,
      modifiedDate: {
        type: Date,
        expires: 34190000
      },
      writtenBy: {
        type: Object,
      },
      itemId: {
        type: String,
        maxlength: 24,
      },
      noOfPoints: {
        type: Number,
      },
      noOfReplies: {
        type: Number,
      },
      hasUpvoted: Boolean,
      hasDownvoted: Boolean,
      hasReported: Boolean,
    });
  commentSchemma.index({ itemId: 1, noOfPoints: -1 });
  //TTL of modifiedDate.
  //157680000 is 5years , 94608000 is 3 years, 63072000 is 2 years , 34190000 is 13 months
  module.exports = mongoose.model("comment", commentSchemma);
})();
