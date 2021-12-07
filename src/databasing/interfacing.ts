import { prisma } from ".prisma/client";
// import * as database from "./prisma";
import { UserSearch, UserInfo, SignUp, User } from "./prisma";

class database_connection {
  async Search(request: string) {
    let matches = await UserSearch(request).catch((e) => {
      throw e;
    });
    return matches;
  }

  async GetUserInfo(user: string) {
    let Info = await UserInfo(user).catch((e) => {
      throw e;
    });
    return Info;
  }

  async SignUp(name: string, email: string, password: string) {
    const Info: User = {
      name: name,
      email: email,
      password: password,
    };
    SignUp(Info);
  }
}

export default database_connection;
