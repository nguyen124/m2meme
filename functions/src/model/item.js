(function () {
  var mongoose = require("mongoose"),
    itemSchema = mongoose.Schema({
      title: {
        type: String,
        maxlength: 150,
      },
      businessName: {
        type: String,
        maxlength: 150,
      },
      files: [Object],
      modifiedDate: Date,
      createdBy: Object,
      tags: {
        type: [
          {
            type: String,
            maxlength: 30,
          },
        ],
        validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
      },
      categories: [String],
      noOfPoints: Number,
      noOfComments: Number,
      noOfViews: Number,
      hasUpvoted: Boolean,
      hasDownvoted: Boolean,
      hasReported: Boolean,
      price: Number,
      address: String,
      address2: String,
      zipcode: String,
      city: String,
      state: String,
      country: String,
      noOfEmployees: Number,
      noOfChairs: Number,
      noOfTables: Number,
      contactPhoneNo: String,
      contactEmail: String,
      income: Number,
      rentCost: Number,
      otherCost: Number,
      leaseEnd: Date,
      yearOld: Number,
      area: Number,
      duration: Number,
      overview: {
        type: String,
        maxlength: 500,
      },
      description: {
        type: String,
        maxlength: 2000,
      },     
      charge: Object,
      status: String,
      geometry: Object
    });
  function arrayLimit(val) {
    return val.length <= 5;
  }
  itemSchema.index({ modifiedDate: -1, tags: 1 });
  module.exports = mongoose.model("item", itemSchema);
})();
