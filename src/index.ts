import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import database_connection from "./databasing/interfacing";
import {
  BaseUserType,
  isBaseUser,
  LoginType,
  ApiResponse,
  MessageInfo
} from "./types";
import { generateCookie, getSession } from "./session";
import dayjs from "dayjs";

dotenv.config();

const api = express();

const port = process.env.PORT;

api.use(
  cors({
    origin: [
      "localhost:3000",
      "http://localhost:3000",
      "https://monochat.app",
      "https://www.monochat.app"
    ],
    credentials: true
  })
);

// api.use(cors());
api.use(express.json()); // for parsing application/json
// define a route handler for the default home page
api.get("/", (req: any, res: any) => {
  res.send("This is the MonoChat Api, if you're not a dev go away!");
});

api.get("/search", async function(req, res: any) {
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
      data: results
    };
    res.send(returnData);
  } catch (e) {
    const returnData: ApiResponse<{ id: string; name: string }[]> = {
      successful: true,
      data: [{ id: "", name: "" }]
    };
    res.send(returnData);
  }
});

api.get("/user", async function(req, res: any) {
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
        payload: results
      };
      res.send(returnData);
    } else {
      const returnData = {
        successful: false,
        error: "no user found"
      };
      res.send(returnData);
    }
  } catch (e) {
    res.send({ successful: false, error: e });
  }
});

api.post("/signup", async (req, res: any) => {
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
            res.send({ successful: true, id: data });
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
    res.send({ successful: false, error: e });
  }
});

api.get("/users/check", async (req, res: any) => {
  try {
    if (req.query.email === undefined || req.query.email === null) {
      res.send({ successful: false, error: "No Email Supplied." });
    } else {
      const ReqEmail = req.query.email as string;
      const connection = new database_connection();

      let UserExists = await connection.DoesUserExist(ReqEmail);
      res.send({ successful: true, exists: UserExists });
    }
  } catch (e) {
    res.send({ successful: false, error: e });
  }
});

api.post("/signin", async (req, res: any) => {
  try {
    if (req.body.email != undefined && req.body.email != undefined) {
      const connection = new database_connection();
      const SignInData: LoginType = {
        email: req.body.email,
        password: req.body.password
      };
      const dbRes = await connection.UserSignIn(SignInData);
      if (dbRes.successful) {
        const UsrAuthCode = dbRes.data.AuthCode;
        const cookie = generateCookie(
          UsrAuthCode,
          dayjs()
            .add(1, "month")
            .toDate()
        );
        // res.setHeader("Set-Cookie", cookie);
        res.cookie(cookie);
        res.json({ successful: true });
      } else {
        res.send({ successful: false, error: "Incorrect Login Details" });
      }
    } else {
      res.send({ successful: false, error: "email and password not supplied" });
    }
  } catch (e) {
    res.send({ successful: false, error: e });
  }
});

api.get("/chats/messages", async (req, res: any) => {
  let error: { happened: boolean; err: string } = { happened: false, err: "" };
  try {
    if (req.query.id != undefined) {
      const connection = new database_connection();
      const result = await connection.GetMessagesFromChat(
        req.query.id as string
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

api.get("/chats/info", async (req, res: any) => {
  let error: { happened: boolean; err: string } = { happened: false, err: "" };
  try {
    if (req.query.id != undefined) {
      const connection = new database_connection();
      let results = await connection.CollectChatInfo(req.query.id as string); // hello
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

api.post("/message/send", async (req, res: any) => {
  try {
    // const UserId = await getSession(req);
    if (
      req.body.msgcontents != null &&
      req.body.senderId != null &&
      // req.body.senderId == UserId &&
      req.body.chatId != null
    ) {
      const connection = new database_connection();
      const NewMsg = await connection.NewMessage(
        req.body.msgcontents as string,
        req.body.senderId as string,
        req.body.chatId as string
      );
      res.send({ successful: true, data: { Msg: NewMsg } });
    } else {
      res.send({ successful: false, error: "Not all data sent" });
    }
  } catch (e) {
    res.send({ successful: false, error: e });
  }
});

// start the Express server
api.listen(port || 8888, () => {
  console.log(`server started at http://localhost:${port}`);
});
