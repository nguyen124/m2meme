(function () {
    var mongoose = require('mongoose'),
        itemSchema = mongoose.Schema({
            title: {
                type: String,
                maxlength: 150
            },
            url: String,
            modifiedDate: Date,
            createdBy: Object,
            tags: [{
                type: String,
                maxlength: 30
            }],
            categories: [String],
            noOfPoints: Number,
            noOfComments: Number,
            hasUpvoted: Boolean,
            hasDownvoted: Boolean,
            hasReported: Boolean,
            files: [Object],
            description: {
                type: String,
                maxlength: 500
            }
        });
    itemSchema.index({ modifiedDate: -1, tags: 1 });
    module.exports = mongoose.model('item', itemSchema);
}());