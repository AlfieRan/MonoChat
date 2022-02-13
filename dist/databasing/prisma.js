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
exports.GetUserChats = exports.isChatPublic = exports.GetMessageInfo = exports.GetChatInfo = exports.SendMessage = exports.GetChatMessages = exports.SignUp = exports.VerifyLoginDetails = exports.DoesUserExist_Email = exports.FollowUser = exports.GetUserFriends = exports.UserInfo = exports.UserSearch = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const argon2_1 = require("argon2");
exports.prisma = new client_1.PrismaClient();
function UserSearch(search) {
    return __awaiter(this, void 0, void 0, function* () {
        //TODO fix this
        const name = search;
        const UserMatches = yield exports.prisma.user.findMany({
            where: {
                name: {
                    contains: name,
                    mode: "insensitive"
                }
            },
            select: {
                id: true,
                name: true
            },
            take: 5
        });
        return UserMatches;
    });
}
exports.UserSearch = UserSearch;
function UserInfo(usrId) {
    return __awaiter(this, void 0, void 0, function* () {
        const UserInfo = yield exports.prisma.user.findUnique({
            where: {
                id: usrId
            },
            select: {
                name: true
            }
        });
        return UserInfo;
    });
}
exports.UserInfo = UserInfo;
function GetUserFriends(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const usrData = yield exports.prisma.user.findUnique({
            where: { id: userId },
            select: { following: true, followers: true }
        });
        let friends = [];
        let TmpA;
        let TmpB;
        if (usrData.following.length < usrData.followers.length) {
            TmpA = usrData.following;
            TmpB = usrData.followers;
        }
        else {
            TmpB = usrData.following;
            TmpA = usrData.followers;
        }
        for (let i = 0; i < TmpA.length; i++) {
            if (TmpA[i] in TmpB) {
                friends.push(TmpA[i]);
            }
        }
        return friends;
    });
}
exports.GetUserFriends = GetUserFriends;
function FollowUser(userId, userToFollow) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield exports.prisma.user.update({
            where: { id: userId },
            data: {
                following: {
                    connect: {
                        id: userToFollow
                    }
                }
            }
        });
    });
}
exports.FollowUser = FollowUser;
function DoesUserExist_Email(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const matchCount = yield exports.prisma.user.count({ where: { email: email } });
        if (matchCount > 0) {
            return true;
        }
        else {
            return false;
        }
    });
}
exports.DoesUserExist_Email = DoesUserExist_Email;
function VerifyLoginDetails(LoginInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const usrDetails = yield exports.prisma.user.findUnique({
            where: {
                email: LoginInfo.email
            }
        });
        if (yield (0, argon2_1.verify)(usrDetails.password, LoginInfo.password)) {
            return { successful: true, id: usrDetails.id };
        }
        else {
            return { successful: false, error: "Incorrect Login Information" };
        }
    });
}
exports.VerifyLoginDetails = VerifyLoginDetails;
function SignUp(UserInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        let hashedPass = yield (0, argon2_1.hash)(UserInfo.password);
        const NewUser = yield exports.prisma.user.create({
            data: {
                name: UserInfo.name,
                email: UserInfo.email,
                password: hashedPass,
                description: "",
                nationality: ""
            }
        });
        return NewUser;
    });
}
exports.SignUp = SignUp;
function GetChatMessages(ChatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const messages = yield exports.prisma.chat.findUnique({
            where: { id: ChatId },
            select: {
                messages: {
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        content: true,
                        sender: { select: { name: true, id: true } }
                    },
                    take: 50
                }
            }
        });
        return messages;
    });
}
exports.GetChatMessages = GetChatMessages;
function SendMessage(Contents, UserId, ChatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const msg = yield exports.prisma.message.create({
            data: {
                content: Contents,
                sender: {
                    connect: {
                        id: UserId
                    }
                },
                chat: { connect: { id: ChatId } }
            },
            select: {
                id: true,
                content: true,
                sender: { select: { id: true, name: true } }
            }
        });
        return msg;
    });
}
exports.SendMessage = SendMessage;
function GetChatInfo(ChatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield exports.prisma.chat.findUnique({
            where: { id: ChatId },
            select: { chatname: true, members: { select: { id: true, name: true } } }
        });
        return info;
    });
}
exports.GetChatInfo = GetChatInfo;
function GetMessageInfo(MsgId) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield exports.prisma.message.findUnique({
            where: { id: MsgId },
            select: { content: true, userId: true, createdAt: true }
        });
        return info;
    });
}
exports.GetMessageInfo = GetMessageInfo;
function isChatPublic(ChatId) {
    return __awaiter(this, void 0, void 0, function* () {
        const isPublic = yield exports.prisma.chat.findUnique({
            where: {
                id: ChatId
            },
            select: {
                ispublic: true
            }
        });
        if (isPublic.ispublic) {
            return true;
        }
        else {
            return false;
        }
    });
}
exports.isChatPublic = isChatPublic;
function GetUserChats(Userid) {
    return __awaiter(this, void 0, void 0, function* () {
        const UserChats = yield exports.prisma.user.findUnique({
            where: {
                id: Userid
            },
            select: {
                chats: { select: { chatname: true, id: true } }
            }
        });
        return UserChats;
    });
}
exports.GetUserChats = GetUserChats;
//# sourceMappingURL=prisma.js.map