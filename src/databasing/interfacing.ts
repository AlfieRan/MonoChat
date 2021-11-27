import { prisma } from ".prisma/client";
import * as database from "./prisma";

export interface dataconnection {
  type: number;
}

class database_connection {
  constructor(requestData: any) {
    console.log(requestData);
  }

  test() {
    let search = "Jeff";

    // server.SignUp(testacc).catch((e) => {
    //   throw e;
    // });

    let matches = database.UserSearch(search).catch((e) => {
      throw e;
    });
    return matches;
  }
}

export default database_connection;
