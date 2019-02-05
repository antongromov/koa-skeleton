const mongoose = require("mongoose");
const counter = require('./counter');

const userSchema  = new mongoose.Schema({
  userId: {
    type: Number,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 5,
    maxlength: 127
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 127
  },
  likes: {
    type: [{
        uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}}],
  }
});

userSchema.pre('save', function preSave(next) {
  if (!this.isNew) {
    next();
    return;
  }
  if (!this.userId) {
    counter.findOneAndUpdate({_id: 'userId'}, {$inc: { seq: 1} }, {new: true, upsert: true}).then((count) => {
      this.userId = count.seq;
      this.username = this.username.toLowerCase();
      next();
    }) ;
  } else {
    next();
  }
});

module.exports = mongoose.model("user", userSchema);