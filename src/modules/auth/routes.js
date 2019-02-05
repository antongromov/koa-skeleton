const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const { compareSync } = require("bcryptjs");
const { BadRequest } = require("../../middleware/errors/errors");
const { issueTokenPair, find, remove } = require("../../services/auth");
const {
  updatePassword,
  createUser,
  findByUsername
} = require("../../services/user");

const router = new Router();

router.post("/signup", async ctx => {
  const { username, password } = ctx.request.body;
  if (!username || !password) {
    throw new BadRequest("email and password required");
  }
  const user = await createUser(username, password, ctx);
  if (!user) {
    throw BadRequest("bad request");
  }
  ctx.body = await issueTokenPair(user.id);
});

router.post("/login", bodyParser(), async ctx => {
  const { username, password } = ctx.request.body;
  const user = await findByUsername(username.toLowerCase());
  if (!user || !compareSync(password, user.password)) {
    throw new BadRequest("bad request", 403);
  }
  ctx.body = await issueTokenPair(user.id);
});

router.post("/refresh", bodyParser(), async ctx => {
  const { refreshToken } = ctx.request.body;
  const dbToken = await find({ token: refreshToken });
  if (!dbToken) {
    return;
  }
  await remove({
    token: refreshToken
  });
  ctx.body = await issueTokenPair(dbToken.userId);
});

router.post("/logout", async ctx => {
  const { id: userId } = ctx.state.user;
  await remove({
    userId
  });
  ctx.body = { success: true };
});

router.post(
  "/me/update-password",
  async ctx => {
    const { goOn } = ctx.checkBody("password").notEmpty().len(5, 20);
    if (!goOn) {
      ctx.response.status = 400;
      throw new BadRequest("Password is invalid", 400);
    }
    const { id: userId } = ctx.state.user;
    const { password } = ctx.request.body;
    await updatePassword(userId, password);
    ctx.body = { success: true };
  }
);

module.exports = router;
