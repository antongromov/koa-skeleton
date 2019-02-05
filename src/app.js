const Koa = require('koa');
const Router = require('koa-router');
const jwtMiddleware = require('./middleware/jwt');
const config = require('./config');
const usersModule = require('./modules/users/routes');
const authModule = require('./modules/auth/routes');
const bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errors/errorHandler');
const jwtError = require('./middleware/errors/jwtError');

function createApp() {
  const app = new Koa();
  // eslint-disable-next-line  global-require
  require('koa-validate')(app);
  
  app.use(errorHandler);
  app.use(jwtError);
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useCreateIndex', true)
  mongoose.connect(config.dbString);
  app.use(bodyParser());

  const router = new Router();
  router.get('/', ctx => {
    ctx.body = 'ok';
  });
  router.use(jwtMiddleware);
  router.use(authModule.routes());
  router.use(usersModule.routes());
  app.use(router.allowedMethods());
  app.use(router.routes());
  return app;
}

if (!module.parent) {
  createApp().listen(config.port);
}

module.exports = createApp;