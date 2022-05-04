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
  GetChatInfo,
  GetMessageInfo,
  SendMessage,
  GetUserChats,
  GetUserToUserChat,
  DoesUserExist_Id,
  isUserInChat,
} from "./prisma";
import { BaseUserType, UserType, LoginType } from "../types";
import { redis, wrapRedis } from "./redis";
import { getAccessToken } from "../jwtmoment";

class database_connection {
  async NewMessage(contents: string, userId: string, chatId: string) {
    const Msg = SendMessage(contents, userId, chatId);
    return Msg;
  }

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

  async DoesUserExistEmail(email: string) {
    let result = await DoesUserExist_Email(email).catch((e) => {
      throw e;
    });
    return result;
  }

  async DoesUserExistId(id: string) {
    const result = await DoesUserExist_Id(id);
    return result;
  }

  async GetMessagesFromChat(ChatId: string, Userid: string) {
    if ((await isChatPublic(ChatId)) || (await isUserInChat(ChatId, Userid))) {
      const msgs = await GetChatMessages(ChatId);
      return { successful: true, messages: msgs.messages };
    } else {
      return { successful: false, error: "Chat is not public" };
    }
  }

  async CollectChatInfo(ChatId: string, UserId: string) {
    const chatIsPublic = await isChatPublic(ChatId);
    const userIsInChat = await isUserInChat(ChatId, UserId);
    if (userIsInChat || chatIsPublic) {
      const Info = await GetChatInfo(ChatId);
      return { successful: true, info: Info };
    } else {
      return { successful: false, error: "Chat is not public" };
    }
  }

  async CollectMessageInfo(MessageId: string) {
    try {
      const Info = await GetMessageInfo(MessageId);
      return { successful: true, info: Info };
    } catch (e) {
      return { successful: false, error: e };
    }
  }

  async UserSignUp(userInfo: BaseUserType) {
    if (userInfo.password === userInfo.passwordCheck) {
      let UserData: UserType = {
        name: userInfo.name,
        email: userInfo.email,
        password: userInfo.password,
      };
      let NewUserInfo = await SignUp(UserData);
      return NewUserInfo.id;
    } else {
      return false;
    }
  }

  async UserSignIn(userInfo: LoginType) {
    const usrStatus = await VerifyLoginDetails(userInfo);
    if (usrStatus.successful) {
      const Auth = await getAccessToken(usrStatus.id);
      try {
        await redis.set(
          `session:${Auth}`,
          usrStatus.id,
          "ex",
          30 * 60 * 60 * 24
        );
      } catch {
        return {
          successful: false,
          error: "Redis error, unable to set Auth code",
        };
      }
      return { successful: true, data: { AuthCode: Auth } };
    } else {
      return { successful: false, error: "Incorrect Login Details" };
    }
  }

  async getUserChats(userid: string) {
    try {
      const usrChats = await wrapRedis(
        `usrChats-${userid}`,
        () => GetUserChats(userid),
        60
      );
      return { successful: true, data: usrChats };
    } catch (e) {
      return { successful: false, error: `Generic Error: ${e}` };
    }
  }

  async getUsertoUserChat(userA: string, userB: string) {
    try {
      const chatId = await GetUserToUserChat(userA, userB);
      return { successful: true, data: chatId };
    } catch (e) {
      return { successful: false, error: `Generic Error: ${e}` };
    }
  }
}

export default database_connection;
