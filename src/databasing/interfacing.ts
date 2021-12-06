import { prisma } from ".prisma/client";
// import * as database from "./prisma";
import { UserSearch } from "./prisma";

export interface dataconnection {
  type: number;
}

class database_connection {
  constructor(requestData: any) {
    console.log("recieved a request");
  }

  async Search(request: string) {
    let matches = await UserSearch(request).catch((e) => {
      throw e;
    });
    return matches;
  }

  async test() {
    let search = "Jeff";

    let matches = await UserSearch(search).catch((e) => {
      throw e;
    });
    return matches;
  }
}

export default database_connection;
