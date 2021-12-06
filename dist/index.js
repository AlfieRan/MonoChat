"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const interfacing_1 = __importDefault(require("./databasing/interfacing"));
dotenv_1.default.config();
const api = (0, express_1.default)();
const port = process.env.SERVER_PORT;
api.use((0, cors_1.default)());
// define a route handler for the default home page
api.get("/", (req, res) => {
    console.log(req.url);
    res.send("Hello world!");
});
api.get("/search", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = {
            type: 0,
        };
        const connection = new interfacing_1.default(data);
        let results;
        if (req.query.q != "") {
            results = yield connection.Search(req.query.q);
        }
        else {
            results = [""];
        }
        // testing stuff - get rid of when done with
        const testData = {
            status: "loaded",
            payload: results,
        };
        // testing end
        res.send(testData);
    });
});
// start the Express server
api.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map