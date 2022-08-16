(function () {
  var mongoose = require("mongoose"),
    itemSchema = mongoose.Schema({
      title: {
        type: String,
        maxlength: 50,
      },
      businessName: {
        type: String,
        maxlength: 50,
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
      needs: {
        type: [
          {
            type: String,
            maxlength: 30,
          },
        ],
        validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
      },
      wage: Number,
      categories: [String],
      noOfPoints: Number,
      noOfComments: Number,
      noOfViews: Number,
      hasUpvoted: Boolean,
      hasReported: Boolean,
      price: Number,
      address: {
        type: String,
        maxlength: 50,
      },
      address2: {
        type: String,
        maxlength: 50,
      },
      zipcode: {
        type: String,
        maxlength: 10,
      },
      city: {
        type: String,
        maxlength: 20,
      },
      state: {
        type: String,
        maxlength: 20,
      },
      country: {
        type: String,
        maxlength: 20,
      },
      noOfEmployees: Number,
      noOfChairs: Number,
      noOfTables: Number,
      contactPhoneNo: {
        type: String,
        maxlength: 18,
      },
      contactEmail: {
        type: String,
        maxlength: 50,
      },
      income: Number,
      rentCost: Number,
      otherCost: Number,
      leaseEnd: Date,
      yearOld: Number,
      area: Number,
      duration: Number,
      overview: {
        type: String,
        maxlength: 180,
      },
      description: {
        type: String,
        maxlength: 1000,
      },
      charge: Object,
      status: {
        type: String,
        maxlength: 20,
      },
      geometry: Object,
    });
  function arrayLimit(val) {
    return val.length <= 5;
  }
  itemSchema.index({ modifiedDate: -1, tags: 1 });
  module.exports = mongoose.model("item", itemSchema);
})();
