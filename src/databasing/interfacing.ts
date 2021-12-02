import { prisma } from ".prisma/client";
import * as database from "./prisma";

export interface dataconnection {
  type: number;
}

class database_connection {
  constructor(requestData: any) {
    console.log("recieved a request");
  }

  async test() {
    let search = "Jeff";

    let matches = await database.UserSearch(search).catch((e) => {
      throw e;
    });
    return matches;
  }
}

export default database_connection;
