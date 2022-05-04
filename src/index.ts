import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import database_connection from "./databasing/interfacing";
import {
  BaseUserType,
  isBaseUser,
  LoginType,
  ApiResponse,
  MessageInfo,
  UserLogging,
} from "./types";
import {
  generateCookie,
  getSession,
  revokeSession,
  sessionKeyFromRequest,
} from "./session";
import dayjs from "dayjs";
import { redis } from "./databasing/redis";
import { prisma } from "./databasing/prisma";
import cookieParser from "cookie-parser";

dotenv.config();

const api = express();

const port = process.env.PORT;

api.use(cookieParser());
api.use(
  cors({
    origin: [
      "localhost:3000",
      "http://localhost:3000",
      "http://localhost.com",
      "http://localhost.com:3000",
      "https://monochat.app",
      "https://www.monochat.app",
    ],
    credentials: true,
  })
);

// api.use(cors());
api.use(express.json()); // for parsing application/json
// define a route handler for the default home page
api.get("/", (req: any, res: any) => {
  res.send("This is the MonoChat Api, if you're not a dev go away!");
});

api.get("/search", async function (req, res) {
  try {
    const connection = new database_connection();
    let results;
    if (
      req.query.q != null &&
      req.query.q != "" &&
      req.query.q != " " &&
      req.query.q != "%20"
    ) {
      results = await connection.Search((req.query.q as string).toLowerCase());
    } else {
      results = [{ id: "", name: "" }];
    }
    const returnData: ApiResponse<{ id: string; name: string }[]> = {
      successful: true,
      data: results,
    };
    res.send(returnData);
  } catch (e) {
    const returnData: ApiResponse<{ id: string; name: string }[]> = {
      successful: true,
      data: [{ id: "", name: "" }],
    };
    res.send(returnData);
  }
});

api.get("/user", async function (req, res) {
  try {
    const connection = new database_connection();
    let results;
    if (req.query.q != null) {
      results = await connection.GetUserInfo(req.query.q as string);
    } else {
      results = [""];
    }

    if (results != null && results != [""]) {
      const returnData = {
        successful: true,
        data: results,
      };
      res.send(returnData);
    } else {
      const returnData = {
        successful: false,
        error: "no user found",
      };
      res.send(returnData);
    }
  } catch (e) {
    res.send({ successful: false, error: e });
  }
});

api.post("/signup", async (req, res) => {
  try {
    if (req.body === undefined || req.body === null) {
      res.send({ successful: false, error: "Body Undefined" });
    } else {
      if (isBaseUser(req.body)) {
        let SignUpData: BaseUserType = req.body;
        if (
          SignUpData.email.split("@")[0].length > 1 &&
          SignUpData.email.split("@")[1].includes(".") &&
          SignUpData.password === SignUpData.passwordCheck
          //    Do other checks here, this is just temporary
        ) {
          const connection = new database_connection();
          let data = await connection.UserSignUp(SignUpData);
          if (data != false) {
            const dbRes = await connection.UserSignIn({
              email: SignUpData.email,
              password: SignUpData.password,
            });
            const UsrAuthCode = dbRes.data.AuthCode;
            const cookie = generateCookie(
              UsrAuthCode,
              dayjs().add(1, "month").toDate()
            );
            res.setHeader("Set-Cookie", cookie);
            res.json({ successful: true, id: data });
          } else {
            res.send({ successful: false, error: "Databasing error" });
          }
        } else {
          res.send({ successful: false, error: "Validation Error" });
        }
      } else {
        res.send({ successful: false, error: "Incorrect Data Parameters" });
      }
    }
  } catch (e) {
    console.log(`Error Occoured: ${e}`);
    res.send({ successful: false, error: e });
  }
});

api.get("/users/check", async (req, res) => {
  try {
    if (req.query.email === undefined || req.query.email === null) {
      res.send({ successful: false, error: "No Email Supplied." });
    } else {
      const ReqEmail = req.query.email as string;
      const connection = new database_connection();

      let UserExists = await connection.DoesUserExistEmail(ReqEmail);
      res.send({ successful: true, exists: UserExists });
    }
  } catch (e) {
    res.send({ successful: false, error: e });
  }
});

api.post("/signin", async (req, res) => {
  try {
    if (req.body.email != undefined && req.body.email != undefined) {
      const connection = new database_connection();
      const SignInData: LoginType = {
        email: req.body.email,
        password: req.body.password,
      };
      const dbRes = await connection.UserSignIn(SignInData);
      if (dbRes.successful) {
        try {
          const UsrAuthCode = dbRes.data.AuthCode;
          const cookie = generateCookie(
            UsrAuthCode,
            dayjs().add(1, "month").toDate()
          );
          res.setHeader("Set-Cookie", cookie);
          res.json({ successful: true });
        } catch {
          res.send({
            successful: false,
            error: "Failed to generate cookie/Redis error",
          });
        }
      } else {
        res.send({ successful: false, error: dbRes.error });
      }
    } else {
      res.send({ successful: false, error: "email and password not supplied" });
    }
  } catch (e) {
    res.send({
      successful: false,
      error: `some kind of generic error has happened: ${e}`,
    });
  }
});

api.get("/chats/messages", async (req, res) => {
  let error: { happened: boolean; err: string } = { happened: false, err: "" };
  try {
    if (req.query.id != undefined) {
      const userId = await getSession(req);
      const connection = new database_connection();
      const result = await connection.GetMessagesFromChat(
        req.query.id as string,
        userId.data
      );
      if (result.successful) {
        res.send({ successful: true, data: { messages: result.messages } });
      } else {
        error = { happened: true, err: result.error };
      }
    } else {
      error = { happened: true, err: "no id supplied" };
    }
  } catch (e) {
    error = { happened: true, err: e };
  }
  if (error.happened) {
    res.send({ successful: false, error: error.err });
  }
});

api.get("/chats/info", async (req, res) => {
  let error: { happened: boolean; err: string } = { happened: false, err: "" };
  try {
    if (req.query.id != undefined) {
      const connection = new database_connection();
      const UserId = await getSession(req);
      let results = await connection.CollectChatInfo(
        req.query.id as string,
        UserId.data
      ); // hello
      if (results.successful) {
        res.send({ successful: true, data: results.info });
      } else {
        error = { happened: true, err: results.error };
      }
    } else {
      error = { happened: true, err: "no id supplied" };
    }
  } catch (e) {
    error = { happened: true, err: e };
  }
  if (error.happened) {
    res.send({ successful: false, error: error.err });
  }
});

api.post("/message/send", async (req, res) => {
  try {
    const UserId = await getSession(req);
    if (UserId.successful) {
      if (req.body.msgcontents != null && req.body.chatId != null) {
        const connection = new database_connection();
        const NewMsg = await connection.NewMessage(
          req.body.msgcontents as string,
          UserId.data,
          req.body.chatId as string
        );
        res.send({ successful: true, data: { Msg: NewMsg } });
      } else {
        res.send({ successful: false, error: "Not all data sent" });
      }
    } else {
      res.send({
        successful: false,
        error: UserId.data,
      });
    }
  } catch (e) {
    res.send({
      successful: false,
      error: `Some kind of error has occoured: ${e}`,
    });
  }
});

api.get("/user/get/chats", async (req, res) => {
  try {
    const UserId = await getSession(req);
    if (UserId.successful) {
      const connection = new database_connection();
      const UserChats = await connection.getUserChats(UserId.data);
      res.send(UserChats);
    } else {
      res.send({ successful: false, error: UserId.data });
    }
  } catch (e) {
    res.send({ successful: false, error: `Generic Error: ${e}` });
  }
});

api.get("/user/checkAuth", async (req, res) => {
  try {
    const UserId = await getSession(req);
    if (UserId.successful) {
      const dbConnection = new database_connection();
      const userName = (await dbConnection.GetUserInfo(UserId.data)).name.split(
        " "
      )[0];
      const data: UserLogging = { logged: true, name: userName };
      res.send({ successful: true, data: data });
    } else {
      const data: UserLogging = { logged: false };
      res.send({ successful: true, data: data });
    }
  } catch (e) {
    res.send({ successful: false, error: `Generic Error: ${e}` });
  }
});

api.get("/chats/info/usertouser", async (req, res) => {
  try {
    const db = new database_connection();

    const UserIdA = await getSession(req);
    const UserIdB = req.query.id as string;

    if (UserIdA.successful && (await db.DoesUserExistId(UserIdB))) {
      const retChatId = await db.getUsertoUserChat(UserIdA.data, UserIdB);
      if (retChatId.successful) {
        res.send({ successful: true, data: retChatId.data });
      } else {
        res.send({
          successful: false,
          error: `Generic Error: ${retChatId.error}`,
        });
      }
    } else {
      res.send({ successful: false, error: "User not logged in" });
    }
  } catch (e) {
    res.send({ successful: false, error: `Generic Error: ${e}` });
  }
});

api.get("/logout", async (req, res) => {
  await revokeSession(sessionKeyFromRequest(req).data);
  res.setHeader("Set-Cookie", generateCookie("", new Date()));
  res.send({ successful: true });
});

api.get("/getUserId", async (req, res) => {
  const UserId = await getSession(req);
  res.send(UserId);
});

(async () => {
  await prisma.$connect();
  await redis.connect();
  api.listen(port || 8888, () => {
    console.log(`server started at http://localhost:${port}`);
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
