(function () {
    var mongoose = require('mongoose'),
        reportSchema = mongoose.Schema({
            reportedItemId: String,
            reportedCommentId: String,
            reasons: [String],
            reportedByUser: Object,
            reportedDate: Date,
            status: String
        });
    reportSchema.index({ reportedDate: -1 })
    module.exports = mongoose.model('report', reportSchema);
}())