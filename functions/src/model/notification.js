(function () {
    var mongoose = require('mongoose'),
        notificationSchemma = mongoose.Schema({
            message: {
                type: String,
                maxlength: 200
            },
            title: {
                type: String,
                maxlength: 100
            },
            noOfPoints: Number,
            notifiedDate: {
                type: Date,
                expires: 34190000
            },
            actionDoneByUsers: [String],
            action: {
                type: String,
                maxlength: 24
            },
            userId: {
                type: String,
                maxlength: 24
            },
            itemId: {
                type: String,
                maxlength: 24
            },
            commentId: {
                type: String,
                maxlength: 24
            },
            hasRead: Boolean
        });
    //TTL of modifiedDate.
    //157680000 is 5years , 94608000 is 3 years, 63072000 is 2 years , 34190000 is 13 months
    notificationSchemma.index({ userId: 1, hasRead: 1 });
    module.exports = mongoose.model('notification', notificationSchemma);
}());