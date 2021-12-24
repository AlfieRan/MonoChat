import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import database_connection from "./databasing/interfacing";
import { Service } from "./types";

dotenv.config();

const api = express();
const port = process.env.SERVER_PORT;
api.use(cors());
api.use(express.json()); // for parsing application/json
// define a route handler for the default home page
api.get("/", (req: any, res: any) => {
  res.send("This is the MonoChat Api, if you're not a dev go away!");
});

api.get("/search", async function(req: any, res: any) {
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
});

api.get("/user", async function(req: any, res: any) {
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
});

api.post("/signup", async function(req: any, res: any) {
  if (req.body === undefined || req.body === null) {
    res.send({ successful: false, error: "Body Undefined" });
  } else {
    let SignUpData = req.body;
    if (
      SignUpData.email.split("@")[0].length > 1 &&
      SignUpData.email.split("@")[1].includes(".") &&
      SignUpData.password === SignUpData.passwordCheck
    ) {
      res.send({ successful: true });
    } else {
      res.send({ successful: false, error: "Validation Error" });
    }
  }
});

// start the Express server
api.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
