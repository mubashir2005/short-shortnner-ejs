const mongoose = require("mongoose");
const shortId = require("shortid");

const shortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    default: shortId.generate,
    required: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  ip: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("ShortUrl", shortUrlSchema);
