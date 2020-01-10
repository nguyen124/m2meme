(function () {
    var mongoose = require('mongoose'),
        modelUserLogSchema = mongoose.Schema({
            userId: {
                type: String
            },
            itemId: {
                type: String
            },
            commentId: {
                type: String
            },
            hasVoted: Number,
            votedDate: Date,
            commented: Number,
            commentedDate: Date,
            reported: Number,
            reportedDate: Date
        });

    modelUserLogSchema.index({ userId: 1, itemId: 1, commentId: 1 });
    module.exports = mongoose.model('modeluserlog', modelUserLogSchema);
}());