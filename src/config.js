const rc = require("rc");

module.exports = rc("JWT", {
  port: process.env.PORT || 3000,
  dbString: "mongodb://localhost:27017/nodejstest",
  secret: "POVIOTESTSECRET"
});
