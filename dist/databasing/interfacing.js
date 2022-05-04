"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as database from "./prisma";
const prisma_1 = require("./prisma");
const redis_1 = require("./redis");
const jwtmoment_1 = require("../jwtmoment");
class database_connection {
    NewMessage(contents, userId, chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const Msg = (0, prisma_1.SendMessage)(contents, userId, chatId);
            return Msg;
        });
    }
    Search(request) {
        return __awaiter(this, void 0, void 0, function* () {
            let matches = yield (0, prisma_1.UserSearch)(request).catch((e) => {
                throw e;
            });
            return matches;
        });
    }
    GetUserInfo(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let Info = yield (0, prisma_1.UserInfo)(user).catch((e) => {
                throw e;
            });
            return Info;
        });
    }
    DoesUserExistEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield (0, prisma_1.DoesUserExist_Email)(email).catch((e) => {
                throw e;
            });
            return result;
        });
    }
    DoesUserExistId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, prisma_1.DoesUserExist_Id)(id);
            return result;
        });
    }
    GetMessagesFromChat(ChatId, Userid) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((yield (0, prisma_1.isChatPublic)(ChatId)) || (yield (0, prisma_1.isUserInChat)(ChatId, Userid))) {
                const msgs = yield (0, prisma_1.GetChatMessages)(ChatId);
                return { successful: true, messages: msgs.messages };
            }
            else {
                return { successful: false, error: "Chat is not public" };
            }
        });
    }
    CollectChatInfo(ChatId, UserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatIsPublic = yield (0, prisma_1.isChatPublic)(ChatId);
            const userIsInChat = yield (0, prisma_1.isUserInChat)(ChatId, UserId);
            if (userIsInChat || chatIsPublic) {
                const Info = yield (0, prisma_1.GetChatInfo)(ChatId);
                return { successful: true, info: Info };
            }
            else {
                return { successful: false, error: "Chat is not public" };
            }
        });
    }
    CollectMessageInfo(MessageId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Info = yield (0, prisma_1.GetMessageInfo)(MessageId);
                return { successful: true, info: Info };
            }
            catch (e) {
                return { successful: false, error: e };
            }
        });
    }
    UserSignUp(userInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userInfo.password === userInfo.passwordCheck) {
                let UserData = {
                    name: userInfo.name,
                    email: userInfo.email,
                    password: userInfo.password,
                };
                let NewUserInfo = yield (0, prisma_1.SignUp)(UserData);
                return NewUserInfo.id;
            }
            else {
                return false;
            }
        });
    }
    UserSignIn(userInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const usrStatus = yield (0, prisma_1.VerifyLoginDetails)(userInfo);
            if (usrStatus.successful) {
                const Auth = yield (0, jwtmoment_1.getAccessToken)(usrStatus.id);
                try {
                    yield redis_1.redis.set(`session:${Auth}`, usrStatus.id, "ex", 30 * 60 * 60 * 24);
                }
                catch (_a) {
                    return {
                        successful: false,
                        error: "Redis error, unable to set Auth code",
                    };
                }
                return { successful: true, data: { AuthCode: Auth } };
            }
            else {
                return { successful: false, error: "Incorrect Login Details" };
            }
        });
    }
    getUserChats(userid) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usrChats = yield (0, redis_1.wrapRedis)(`usrChats-${userid}`, () => (0, prisma_1.GetUserChats)(userid), 60 * 10);
                return { successful: true, data: usrChats };
            }
            catch (e) {
                return { successful: false, error: `Generic Error: ${e}` };
            }
        });
    }
    getUsertoUserChat(userA, userB) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatId = yield (0, prisma_1.GetUserToUserChat)(userA, userB);
                return { successful: true, data: chatId };
            }
            catch (e) {
                return { successful: false, error: `Generic Error: ${e}` };
            }
        });
    }
}
exports.default = database_connection;
//# sourceMappingURL=interfacing.js.map