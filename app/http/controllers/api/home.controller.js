const Controller = require("../controller");

module.exports = new (class HomeController extends Controller {
    async indexPage(req, res, next) {
        try {
            return res.status(httpStatus.OK).send("index page store");
        } catch (err) {
            next(err);
        }
    }
})();
