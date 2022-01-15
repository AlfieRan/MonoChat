import { prisma } from ".prisma/client";
// import * as database from "./prisma";
import {
  UserSearch,
  UserInfo,
  SignUp,
  DoesUserExist_Email,
  VerifyLoginDetails
} from "./prisma";
import { BaseUserType, UserType, LoginType } from "../types";

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

  async DoesUserExist(email: string) {
    let result = await DoesUserExist_Email(email).catch(e => {
      throw e;
    });
    return result;
  }

  async UserSignUp(userInfo: BaseUserType) {
    if (userInfo.password === userInfo.passwordCheck) {
      let UserData: UserType = {
        name: userInfo.name,
        email: userInfo.email,
        password: userInfo.password
      };
      let uid = await SignUp(UserData);
      return uid;
    } else {
      return false;
    }
  }

  async UserSignIn(userInfo: LoginType) {
    if (await VerifyLoginDetails(userInfo)) {
      return true;
    } else {
      return false;
    }
  }
}

export default database_connection;
