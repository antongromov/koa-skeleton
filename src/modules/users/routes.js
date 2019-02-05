const Router = require("koa-router");
const { NotFound } = require("../../middleware/errors/errors");
require("./counter");
require("./user");
const {
  mostLiked,
  find,
  addLike,
  unLike,
  findPublicFields
} = require("../../services/user");

const router = new Router();

router.get("/most-liked", async ctx => {
  ctx.body = await mostLiked();
});

router.get("/me", async ctx => {
  ctx.body = await find({ _id: ctx.state.user.id });
});

router.get("/user/:id", async ctx => {
  const user = await findPublicFields({ userId: ctx.params.id });
  if (!user) {
    throw new NotFound("Not Found");
  }
  ctx.body = user;
});

router.post("/user/:id/like", async ctx => {
  await addLike({ senderId: ctx.state.user.id, recipientId: ctx.params.id });
  ctx.body = { success: true };
});

router.post("/user/:id/unlike", async ctx => {
  await unLike({ senderId: ctx.state.user.id, recipientId: ctx.params.id });
  ctx.body = { success: true };
});

module.exports = router;
