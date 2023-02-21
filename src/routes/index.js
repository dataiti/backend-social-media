const userRouter = require("./user");
const authRouter = require("./auth");
const postRouter = require("./post");

const routes = (app) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/post", postRouter);
};

module.exports = routes;
