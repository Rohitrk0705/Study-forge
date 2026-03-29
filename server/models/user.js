const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  notes: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("User", userSchema);