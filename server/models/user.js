const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  notes: String
});

module.exports = mongoose.model("User", userSchema);