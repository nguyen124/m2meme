(function () {
    var mongoose = require('mongoose'),
        reportSchema = mongoose.Schema({
            reportedItemId: {
                type: String,
                maxlength: 24
            },
            reportedCommentId: {
                type: String,
                maxlength: 24
            },
            content: [Object],
            reasons: [{
                type: String,
                maxlength: 256
            }],
            reportedByUser: Object,
            reportedDate: Date,
            status: {
                type: String,
                maxlength: 24
            }
        });
    reportSchema.index({ reportedDate: -1 });
    module.exports = mongoose.model('report', reportSchema);
}());