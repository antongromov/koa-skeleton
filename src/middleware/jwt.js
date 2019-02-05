const jwtMiddleware = require('koa-jwt');
const config = require('../config');
const pathToRegexp = require('path-to-regexp');

const unprotected = [
  pathToRegexp('/login'),
  pathToRegexp('/signup'),
  pathToRegexp('/user/:id'),
  pathToRegexp('/most-liked'),
];
module.exports =  jwtMiddleware({
  secret: config.secret,
}).unless({ path: unprotected});