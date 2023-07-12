const { StatusCodes } = require("http-status-codes");
const { UserModel } = require("../../../models/user.model");
const Controller = require("../controller");

class StartController extends Controller {
    async start(req, res, next) {
        try {
            const { username } = req.body;
            const user = await UserModel.findOne({
                username,
            });
            if (!user) {
                await UserModel.create({ username });
                return res
                    .status(StatusCodes.CREATED)
                    .json({ message: "user saved" });
            }
            return res.status(StatusCodes.OK).json({ message: "success" });
        } catch (err) {
            next(err);
        }
    }
    async getCount(req, res, next) {
        try {
            const { username } = req.params;
            const countResult = await UserModel.findOne(
                {
                    username,
                },
                { count: 1, _id: 0 },
                { lean: true }
            );
            return res
                .status(StatusCodes.OK)
                .json({ message: "success", count: countResult.count });
        } catch (err) {
            next(err);
        }
    }
    async addToHistory(req, res, next) {
        try {
            const { url, username } = req.body;
            const updateResult = await UserModel.updateOne(
                {
                    username,
                },
                { $addToSet: { searchs: url }, task: url }
            );
            return res
                .status(StatusCodes.OK)
                .json({ status: StatusCodes.OK, message: "history updated" });
        } catch (err) {
            next(err);
        }
    }
    async getTask(req, res, next) {
        try {
            const { username } = req.params;
            const taskResult = await UserModel.findOne(
                {
                    username,
                },
                { task: 1, _id: 0 },
                { lean: true }
            );
            return res
                .status(StatusCodes.OK)
                .json({ message: "success", task: taskResult.task });
        } catch (err) {
            next(err);
        }
    }
    async decreaseCount(req, res, next) {
        try {
            const { username } = req.params;
            const updateResult = await UserModel.updateOne(
                {
                    username,
                },
                { $inc: { count: -1 }, task: "" }
            );
            if (updateResult.modifiedCount <= 0) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    status: INTERNAL_SERVER_ERROR,
                    message: "count did not change",
                });
            }
            return res.status(StatusCodes.OK).json({ message: "success" });
        } catch (err) {
            next(err);
        }
    }
    async getHistory(req, res, next) {
        try {
            const { username } = req.params;
            const historyResult = await UserModel.findOne(
                {
                    username,
                },
                { searchs: 1, _id: 0 },
                { lean: true }
            );
            console.log(historyResult);
            return res
                .status(StatusCodes.OK)
                .json({ message: "success", history: historyResult.searchs });
        } catch (err) {
            next(err);
        }
    }
}
module.exports = {
    StartController: new StartController(),
};
