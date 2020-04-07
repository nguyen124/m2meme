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
            tags: {
                type: [{
                    type: String,
                    maxlength: 30
                }],
                validate: [arrayLimit, "{PATH} exceeds the limit of 5"]
            },
            categories: [String],
            noOfPoints: Number,
            noOfComments: Number,
            noOfViews: Number,
            hasUpvoted: Boolean,
            hasDownvoted: Boolean,
            hasReported: Boolean,
            files: [Object],
            description: {
                type: String,
                maxlength: 500
            }
        });
    function arrayLimit(val) {
        return val.length <= 5;
    }
    itemSchema.index({ modifiedDate: -1, tags: 1 });
    module.exports = mongoose.model('item', itemSchema);
}());