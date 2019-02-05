const mongoose = require("mongoose");
const User = require("../modules/users/user");
const { BadRequest } = require("../middleware/errors/errors");
const { generateHash } = require("./auth");

const userPublicFields = {
  username: true,
  likes: true,
  userId: true,
  _id: false
};

async function find(userId) {
  return User.findOne(userId).select(userPublicFields);
}

async function findPublicFields(query) {
  return User.findOne(query).select(userPublicFields);
}

async function findByUsername(username) {
  return User.findOne({ username });
}

async function updatePassword(id, password) {
  return User.findOneAndUpdate(
    { _id: id },
    { password: await generateHash(password) }
  );
}

async function unLike(data) {
  const recipient = await User.findOne({ userId: data.recipientId });
  const senderId = mongoose.Types.ObjectId(data.senderId);
  return recipient.updateOne({
    $pull: {
      likes: { _id: senderId }
    }
  });
}

async function addLike(data) {
  await unLike(data);
  const recipient = await User.findOne({ userId: data.recipientId });
  const senderId = mongoose.Types.ObjectId(data.senderId);
  recipient.likes.push(senderId);
  return recipient.save();
}

async function createUser(username, password) {
  let user = await User.findOne({ username: username.toLowerCase() });
  if (user) {
    throw new BadRequest("user exists");
  }
  user = new User({ username, password: await generateHash(password) });
  await user.save();
  return user;
}

async function mostLiked() {
  return User.find({}, userPublicFields).sort({ likes: -1 });
}
module.exports = {
  findPublicFields,
  findByUsername,
  find,
  addLike,
  unLike,
  updatePassword,
  mostLiked,
  createUser
};
