import { prisma } from ".prisma/client";
// import * as database from "./prisma";
import {
  UserSearch,
  UserInfo,
  SignUp,
  DoesUserExist_Email,
  VerifyLoginDetails,
  isChatPublic,
  GetChatMessages,
  GetChatInfo
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

  async GetMessagesFromChat(ChatId: string) {
    if (await isChatPublic(ChatId)) {
      const messages = await GetChatMessages(ChatId);
      return { successful: true, messages: messages };
    } else {
      return { successful: false, error: "Chat is not public" };
    }
  }

  async CollectChatInfo(ChatId: string) {
    const chatIsPublic = await isChatPublic(ChatId);
    if (!chatIsPublic)
      return { successful: false, error: "Chat is not public" };

    const Info = await GetChatInfo(ChatId);
    return { successful: true, info: Info };
  }

  async UserSignUp(userInfo: BaseUserType) {
    if (userInfo.password === userInfo.passwordCheck) {
      let UserData: UserType = {
        name: userInfo.name,
        email: userInfo.email,
        password: userInfo.password
      };
      let NewUserInfo = await SignUp(UserData);
      return NewUserInfo.id;
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
