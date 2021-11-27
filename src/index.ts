import express from "express";
import dotenv from "dotenv";
import database_connection from "./databasing/interfacing";

dotenv.config();

const api = express();
const port = process.env.SERVER_PORT;

// define a route handler for the default home page
api.get("/", (req: any, res: any) => {
  console.log(req.url);
  res.send("Hello world!");
});

api.get("/search", (req: any, res: any) => {
  let data = {
    type: 0,
  };

  const connection = new database_connection(data);
  res.send(`${connection.test()}`);
});

// start the Express server
api.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
