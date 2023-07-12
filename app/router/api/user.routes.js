const {
    StartController,
} = require("../../http/controllers/api/user.controller");

const router = require("express").Router();

router.post("/start", StartController.start);
router.get("/getCount/:username", StartController.getCount);
router.post("/addToHistory", StartController.addToHistory);
router.get("/getTask/:username", StartController.getTask);
router.get("/limit/:username", StartController.decreaseCount);
router.get("/getHistory/:username", StartController.getHistory);

module.exports = {
    UserRoutes: router,
};
