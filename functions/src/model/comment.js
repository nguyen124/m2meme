(function () {
    var mongoose = require('mongoose'),
        commentSchemma = mongoose.Schema({
            parentCommentId: {
                type: String
            },
            content: [{
                url: {
                    type: String,
                    maxlength: 1024
                },
                filename: String,
                fileType: String
            }],
            replyTo: Object,
            modifiedDate: {
                type: Date
            },
            writtenBy: {
                type: Object
            },
            itemId: {
                type: String
            },
            noOfPoints: {
                type: Number
            },
            noOfReplies: {
                type: Number
            },
            hasUpvoted: Boolean,
            hasDownvoted: Boolean,
            hasReported: Boolean
        });
    commentSchemma.index({ itemId: 1, noOfPoints: -1 });
    module.exports = mongoose.model('comment', commentSchemma);
}());