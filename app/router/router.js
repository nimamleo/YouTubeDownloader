const router = require("express").Router();
const { HomeRoutes } = require("./api/index");
const userRoutes = require("./api/user.routes");

router.use("/", HomeRoutes);
router.use("/user", userRoutes.UserRoutes);

module.exports = {
    AllRoutes: router,
};
