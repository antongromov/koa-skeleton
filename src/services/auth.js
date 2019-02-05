const config = require("../config");
const Token = require("../modules/auth/token");
const jwt = require("jsonwebtoken");
const uuid = require("uuid/v4");
const bcrypt = require("bcryptjs");

async function find(query) {
  return Token.findOne(query);
}

async function add(entry) {
  const model = new Token(entry);
  return model.save();
}

async function issueTokenPair(userId) {
  const newRefreshToken = uuid();
  await add({
    token: newRefreshToken,
    userId
  });

  return {
    token: jwt.sign({ id: userId }, config.secret),
    refreshToken: newRefreshToken
  };
}

async function remove(query) {
  return Token.findAndRemove(query);
}

async function generateHash(password) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

module.exports = {
  generateHash,
  issueTokenPair,
  find,
  remove
};
