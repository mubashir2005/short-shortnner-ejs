const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  name: {
    type: String,
    required:true
  },
  email: {
    type: String,
    required:true,
  },
  GoogleId:{
    type: Number,
  },
  GithubId:{
    type: Number,
  }




});
module.exports = mongoose.model("Auth", authSchema);
