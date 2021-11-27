"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const interfacing_1 = __importDefault(require("./databasing/interfacing"));
dotenv_1.default.config();
const api = (0, express_1.default)();
const port = process.env.SERVER_PORT;
// define a route handler for the default home page
api.get("/", (req, res) => {
    console.log(req.url);
    res.send("Hello world!");
});
api.get("/search", (req, res) => {
    let data = {
        type: 0,
    };
    const connection = new interfacing_1.default(data);
    res.send(`${connection.test()}`);
});
// start the Express server
api.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map