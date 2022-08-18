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
            reportedDate: {
                type: Date,
                expires: 34190000
            },
            status: {
                type: String,
                maxlength: 24
            }
        });
    //TTL of modifiedDate.
    //157680000 is 5years , 94608000 is 3 years, 63072000 is 2 years , 34190000 is 13 months
    reportSchema.index({ reportedDate: -1 });
    module.exports = mongoose.model('report', reportSchema);
}());