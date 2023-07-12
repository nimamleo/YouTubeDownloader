const Application = require("./app/server");
new Application(5000, process.env.DATABASE_URL);
// new Application(5000, process.env.DB);

