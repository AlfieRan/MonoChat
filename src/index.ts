import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import database_connection from "./databasing/interfacing";
import { Service } from "./types";

dotenv.config();

const api = express();
const port = process.env.SERVER_PORT;
api.use(cors());
// define a route handler for the default home page
api.get("/", (req: any, res: any) => {
  console.log(req.url);
  res.send("Hello world!");
});

api.get("/search", async function (req: any, res: any) {
  let data = {
    type: 0,
  };
  const connection = new database_connection(data);
  let results;
  if (req.query.q != "") {
    results = await connection.Search(req.query.q);
  } else {
    results = [""];
  }

  // testing stuff - get rid of when done with
  const testData: Service<any> = {
    status: "loaded",
    payload: results,
  };
  // testing end
  res.send(testData);
});

// start the Express server
api.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
