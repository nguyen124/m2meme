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
            itemId: String,
            commentId: String,
            userId: String,
            notifiedDate: Date,
            hasRead: Boolean
        });
    notificationSchemma.index({ notifiedDate: 1, status: 1 });
    module.exports = mongoose.model('notification', notificationSchemma);
}());