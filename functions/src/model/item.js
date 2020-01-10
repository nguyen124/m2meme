(function () {
    var mongoose = require('mongoose'),
        itemSchema = mongoose.Schema({
            title: {
                type: String,
                maxlength: 500
            },
            url: {
                type: String,
                maxlength: 1024
            },
            modifiedDate: Date,
            createdBy: Object,
            tags: [String],
            categories: [String],
            noOfPoints: Number,
            noOfComments: Number,
            hasUpvoted: Boolean,
            hasDownvoted: Boolean,
            hasReported: Boolean
        });
    itemSchema.index({ modifiedDate: -1 })
    module.exports = mongoose.model('item', itemSchema);
}());