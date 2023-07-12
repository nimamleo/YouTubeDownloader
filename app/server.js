const express = require("express");
const { default: mongoose } = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const { AllRoutes } = require("./router/router");
const createHttpError = require("http-errors");
require("dotenv").config();
const cors = require("cors");

module.exports = class Application {
    #app = express();
    #DB_URI;
    #PORT;
    constructor(PORT, DB_URI) {
        this.#PORT = PORT;
        this.#DB_URI = DB_URI;
        this.configApplication();
        this.connectToMongoDB();
        this.createServer();
        this.createRoutes();
        this.errorHandling();
    }
    configApplication() {
        this.#app.use(cors());
        this.#app.use(morgan("dev"));
        this.#app.use(express.json());
        this.#app.use(express.urlencoded({ extended: true }));
    }
    createServer() {
        const http = require("http");
        const server = http.createServer(this.#app);
        server.listen(this.#PORT, () => {
            console.log("run > on port " + this.#PORT);
        }); 
    }
    connectToMongoDB() {
        mongoose.connect(this.#DB_URI, { authSource: "admin" }).catch((err) => {
            return console.error(err.message);
        });
        mongoose.connection.on("connected", () => {
            console.log("mongoose connected to DB");
        });
        mongoose.connection.on("disconnected", () => {
            console.log("mongoose disconnected from DB");
        });
    }
    createRoutes() {
        this.#app.use(AllRoutes);
    }
    errorHandling() {
        this.#app.use((req, res, next) => {
            next(createHttpError.NotFound("page not found"));
        });
        this.#app.use((error, req, res, next) => {
            const serverError = createHttpError.InternalServerError();
            const statusCode = error.status || serverError.statusCode;
            const message = error.message || serverError.message;
            console.log(error);
            return res.status(statusCode).json({
                errors: {
                    statusCode,
                    message,
                },
            });
        });
    }
};
