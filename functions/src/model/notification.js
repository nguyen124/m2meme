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
            action: String,
            userId: String,
            itemId: String,
            commentId: String,
            hasRead: Boolean
        });
    notificationSchemma.index({ userId: 1, hasRead: 1 });
    module.exports = mongoose.model('notification', notificationSchemma);
}());