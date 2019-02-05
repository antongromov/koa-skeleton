const ExtendableError = require("es6-error");

exports.BadRequest = class BadRequest extends ExtendableError {
  constructor(message, status) {
    super();
    this.body = {
      errors: message
    };
    this.status = status || 400;
  }
};

exports.NotFound = class NotFound extends ExtendableError {
  constructor(message, status) {
    super("Not Found");
    this.body = {
      errors: message
    };
    this.status = status || 404;
  }
};
