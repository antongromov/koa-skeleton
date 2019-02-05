const mongoose = require("mongoose");

const tokenSchema  = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
  },
  userId: {
    type: String
  },
});

module.exports = mongoose.model("token", tokenSchema);