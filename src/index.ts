import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import database_connection from "./databasing/interfacing";
import {
  Service,
  BaseUserType,
  isBaseUser,
  UserType,
  LoginType
} from "./types";

dotenv.config();

const api = express();

const port = process.env.PORT;

api.use(cors());
api.use(express.json()); // for parsing application/json
// define a route handler for the default home page
api.get("/", (req: any, res: any) => {
  res.send("This is the MonoChat Api, if you're not a dev go away!");
});

api.get("/search", async function(req: any, res: any) {
  try {
    const connection = new database_connection();
    let results;
    if (req.query.q != null && req.query.q != "") {
      results = await connection.Search(
        req.query.q.toLowerCase().replaceAll("%20", " ")
      );
    } else {
      results = [""];
    }
    const returnData: Service<any> = {
      status: "loaded",
      payload: results
    };
    res.send(returnData);
  } catch (e) {
    const returnData: Service<any> = {
      status: "loaded",
      payload: [""]
    };
    res.send(returnData);
  }
});

api.get("/user", async function(req: any, res: any) {
  try {
    const connection = new database_connection();
    let results;
    if (req.query.q != null) {
      results = await connection.GetUserInfo(req.query.q);
    } else {
      results = [""];
    }

    const returnData: Service<any> = {
      status: "loaded",
      payload: results
    };

    res.send(returnData);
  } catch (e) {
    res.send({ successful: false, error: e });
  }
});

api.post("/signup", async (req: any, res: any) => {
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

api.get("/users/check", async (req: any, res: any) => {
  try {
    if (req.query.email === undefined || req.query.email === null) {
      res.send({ successful: false, error: "No Email Supplied." });
    } else {
      const ReqEmail = req.query.email;
      const connection = new database_connection();

      let UserExists = await connection.DoesUserExist(ReqEmail);
      res.send({ successful: true, exists: UserExists });
    }
  } catch (e) {
    res.send({ successful: false, error: e });
  }
});

api.post("/signin", async (req: any, res: any) => {
  try {
    if (req.body.email != undefined && req.body.email != undefined) {
      const connection = new database_connection();
      const SignInData: LoginType = {
        email: req.body.email,
        password: req.body.password
      };
      if (await connection.UserSignIn(SignInData)) {
        res.send({ successful: true });
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

// start the Express server
api.listen(port || 8888, () => {
  console.log(`server started at http://localhost:${port}`);
});
