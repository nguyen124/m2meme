(function () {
    var mongoose = require('mongoose'),
        commentSchemma = mongoose.Schema({
            parentCommentId: {
                type: String,
                maxlength: 24
            },
            content: [{
                url: {
                    type: String,
                    maxlength: 1024
                },
                filename: {
                    type: String,
                    maxlength: 64
                },
                fileType: {
                    type: String,
                    maxlength: 24
                }
            }],
            replyTo: Object,
            modifiedDate: {
                type: Date
            },
            writtenBy: {
                type: Object
            },
            itemId: {
                type: String,
                maxlength: 24
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