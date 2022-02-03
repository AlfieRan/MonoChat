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
const types_1 = require("./types");
const prisma_1 = require("./databasing/prisma");
dotenv_1.default.config();
const api = (0, express_1.default)();
const port = process.env.PORT;
api.use((0, cors_1.default)({
    origin: [
        "localhost:3000",
        "http://localhost:3000",
        "https://monochat.app",
        "https://www.monochat.app"
    ],
    credentials: true
}));
// api.use(cors());
api.use(express_1.default.json()); // for parsing application/json
// define a route handler for the default home page
api.get("/", (req, res) => {
    res.send("This is the MonoChat Api, if you're not a dev go away!");
});
api.get("/search", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = new interfacing_1.default();
            let results;
            if (req.query.q != null &&
                req.query.q != "" &&
                req.query.q != " " &&
                req.query.q != "%20") {
                results = yield connection.Search(req.query.q.toLowerCase());
            }
            else {
                results = [{ id: "", name: "" }];
            }
            const returnData = {
                successful: true,
                data: results
            };
            res.send(returnData);
        }
        catch (e) {
            const returnData = {
                successful: true,
                data: [{ id: "", name: "" }]
            };
            res.send(returnData);
        }
    });
});
api.get("/user", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = new interfacing_1.default();
            let results;
            if (req.query.q != null) {
                results = yield connection.GetUserInfo(req.query.q);
            }
            else {
                results = [""];
            }
            if (results != null && results != [""]) {
                const returnData = {
                    successful: true,
                    payload: results
                };
                res.send(returnData);
            }
            else {
                const returnData = {
                    successful: false,
                    error: "no user found"
                };
                res.send(returnData);
            }
        }
        catch (e) {
            res.send({ successful: false, error: e });
        }
    });
});
api.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body === undefined || req.body === null) {
            res.send({ successful: false, error: "Body Undefined" });
        }
        else {
            if ((0, types_1.isBaseUser)(req.body)) {
                let SignUpData = req.body;
                if (SignUpData.email.split("@")[0].length > 1 &&
                    SignUpData.email.split("@")[1].includes(".") &&
                    SignUpData.password === SignUpData.passwordCheck
                //    Do other checks here, this is just temporary
                ) {
                    const connection = new interfacing_1.default();
                    let data = yield connection.UserSignUp(SignUpData);
                    if (data != false) {
                        res.send({ successful: true, id: data });
                    }
                    else {
                        res.send({ successful: false, error: "Databasing error" });
                    }
                }
                else {
                    res.send({ successful: false, error: "Validation Error" });
                }
            }
            else {
                res.send({ successful: false, error: "Incorrect Data Parameters" });
            }
        }
    }
    catch (e) {
        res.send({ successful: false, error: e });
    }
}));
api.get("/users/check", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.query.email === undefined || req.query.email === null) {
            res.send({ successful: false, error: "No Email Supplied." });
        }
        else {
            const ReqEmail = req.query.email;
            const connection = new interfacing_1.default();
            let UserExists = yield connection.DoesUserExist(ReqEmail);
            res.send({ successful: true, exists: UserExists });
        }
    }
    catch (e) {
        res.send({ successful: false, error: e });
    }
}));
api.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.email != undefined && req.body.email != undefined) {
            const connection = new interfacing_1.default();
            const SignInData = {
                email: req.body.email,
                password: req.body.password
            };
            const dbRes = yield connection.UserSignIn(SignInData);
            if (dbRes.successful) {
                // const UsrAuthCode = dbRes.data.AuthCode;
                // const cookie = generateCookie(
                //   UsrAuthCode,
                //   dayjs()
                //     .add(1, "month")
                //     .toDate()
                // );
                // res.cookie(cookie);
                res.json({ successful: true });
            }
            else {
                res.send({ successful: false, error: "Incorrect Login Details" });
            }
        }
        else {
            res.send({ successful: false, error: "email and password not supplied" });
        }
    }
    catch (e) {
        res.send({ successful: false, error: e });
    }
}));
api.get("/chats/messages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let error = { happened: false, err: "" };
    try {
        if (req.query.id != undefined) {
            const connection = new interfacing_1.default();
            const result = yield connection.GetMessagesFromChat(req.query.id);
            if (result.successful) {
                res.send({ successful: true, data: { messages: result.messages } });
            }
            else {
                error = { happened: true, err: result.error };
            }
        }
        else {
            error = { happened: true, err: "no id supplied" };
        }
    }
    catch (e) {
        error = { happened: true, err: e };
    }
    if (error.happened) {
        res.send({ successful: false, error: error.err });
    }
}));
api.get("/chats/info", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let error = { happened: false, err: "" };
    try {
        if (req.query.id != undefined) {
            const connection = new interfacing_1.default();
            let results = yield connection.CollectChatInfo(req.query.id); // hello
            if (results.successful) {
                res.send({ successful: true, data: results.info });
            }
            else {
                error = { happened: true, err: results.error };
            }
        }
        else {
            error = { happened: true, err: "no id supplied" };
        }
    }
    catch (e) {
        error = { happened: true, err: e };
    }
    if (error.happened) {
        res.send({ successful: false, error: error.err });
    }
}));
// api.get("/message/info", async (req, res: any) => {
//   try {
//     if (req.query.id != undefined) {
//       const connection = new database_connection();
//       let results = await connection.CollectMessageInfo(req.query.id as string); // hello
//       if (results.successful) {
//         res.send({ successful: true, data: results.info });
//       } else {
//         res.send({ successful: false, error: results.error });
//       }
//     } else {
//       res.send({ successful: false, error: "no id supplied" });
//     }
//   } catch (e) {
//     res.send({ successful: false, error: e });
//   }
// });
api.post("/message/send", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const UserId = await getSession(req);
        if (req.body.msgcontents != null &&
            req.body.senderId != null &&
            // req.body.senderId == UserId &&
            req.body.chatId != null) {
            const connection = new interfacing_1.default();
            const NewMsg = yield connection.NewMessage(req.body.msgcontents, req.body.senderId, req.body.chatId);
            res.send({ successful: true, data: { Msg: NewMsg } });
        }
        else {
            res.send({ successful: false, error: "Not all data sent" });
        }
    }
    catch (e) {
        res.send({ successful: false, error: e });
    }
}));
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.prisma.$connect();
    // await redis.connect();
    api.listen(port || 8888, () => {
        console.log(`server started at http://localhost:${port}`);
    });
}))().catch(e => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=index.js.map