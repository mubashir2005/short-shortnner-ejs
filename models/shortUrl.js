const mongoose = require("mongoose");
const shortId = require("shortid");

const shortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
    default: shortId.generate,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  GivenEmail: {
    type: String,
    required:true,
  },
  realEmail: {
    type: String,
    required:true,
  },
  name: {
    type: String,
    required:true
  },
  ip:{
    type: String,
    required: true
  }

});

module.exports = mongoose.model("ShortUrl", shortUrlSchema);
