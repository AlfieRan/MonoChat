import { prisma } from ".prisma/client";
// import * as database from "./prisma";
import { UserSearch, UserInfo, SignUp } from "./prisma";
import { BaseUserType, UserType } from "../types";

class database_connection {
  async Search(request: string) {
    let matches = await UserSearch(request).catch(e => {
      throw e;
    });
    return matches;
  }

  async GetUserInfo(user: string) {
    let Info = await UserInfo(user).catch(e => {
      throw e;
    });
    return Info;
  }

  async UserSignUp(userInfo: BaseUserType) {
    if (userInfo.password === userInfo.passwordCheck) {
      let UserData: UserType = {
        name: userInfo.firstname + " " + userInfo.surname,
        email: userInfo.email,
        password: userInfo.password
      };
      let uid = await SignUp(UserData);
      return uid;
    } else {
      return false;
    }
  }
}

export default database_connection;
