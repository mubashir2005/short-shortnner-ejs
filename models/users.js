const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  name: {
    type: String,

  },
  email: {
    type: String,

  },

});
module.exports = mongoose.model("Auth", authSchema);
