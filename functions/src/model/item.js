(function () {
  var mongoose = require("mongoose"),
    FileSchema = mongoose.Schema({
      url: {
        type: String,
        maxlength: 256,
      },
      filename: {
        type: String,
        maxlength: 128,
      },
      fileType: {
        type: String,
        maxlength: 50,
      },
    }),
    CreateBySchema = mongoose.Schema({
      userId: {
        type: String,
        maxlength: 24,
      },
      avatar: {
        type: String,
        maxlength: 256,
      },
      username: {
        type: String,
        maxlength: 50,
      },
    }),
    ChargeSchema = mongoose.Schema({
      id: {
        type: String,
        maxlength: 50,
      },
      amount: Number,
      description: {
        type: String,
        maxlength: 100,
      },
      created: Number,
    }),
    itemSchema = mongoose.Schema({
      title: {
        type: String,
        maxlength: 100,
      },
      businessName: {
        type: String,
        maxlength: 50,
      },
      files: [FileSchema],
      modifiedDate: {
        type: Date,
        expires: 157680000,
      },
      createdBy: CreateBySchema,
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
      categories: [
        {
          type: String,
          maxlength: 50,
        },
      ],
      noOfPoints: Number,
      noOfComments: Number,
      noOfViews: Number,
      hasUpvoted: Boolean,
      hasReported: Boolean,
      price: Number,
      address: {
        type: String,
        maxlength: 100,
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
      charge: ChargeSchema,
      status: {
        type: String,
        maxlength: 20,
      },
      geometry: Object,
      expired: {
        type: Boolean,
      },
      refundable: {
        type: Boolean,
      },
    });
  function arrayLimit(val) {
    return val.length <= 5;
  }
  itemSchema.index({ modifiedDate: -1, tags: 1 });
  //TTL of modifiedDate.
  //157680000 is 5years , 94608000 is 3 years, 63072000 is 2 years , 34190000 is 13 months
  module.exports = mongoose.model("item", itemSchema);
})();
