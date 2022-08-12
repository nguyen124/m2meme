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
            notifiedDate: Date,
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
    notificationSchemma.index({ userId: 1, hasRead: 1 });
    module.exports = mongoose.model('notification', notificationSchemma);
}());