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
exports.SignUp = exports.VerifyLoginDetails = exports.DoesUserExist_Email = exports.UserInfo = exports.UserSearch = void 0;
const client_1 = require("@prisma/client");
const argon2_1 = require("argon2");
const prisma = new client_1.PrismaClient();
function UserSearch(search) {
    return __awaiter(this, void 0, void 0, function* () {
        //TODO fix this
        const name = search;
        const UserMatches = yield prisma.user.findMany({
            where: {
                name: {
                    contains: name,
                    mode: "insensitive"
                }
            },
            select: {
                id: true,
                name: true
            }
        });
        return UserMatches;
    });
}
exports.UserSearch = UserSearch;
function UserInfo(reqid) {
    return __awaiter(this, void 0, void 0, function* () {
        const UserInfo = yield prisma.user.findUnique({
            where: {
                id: reqid
            },
            select: {
                name: true
            }
        });
        return UserInfo;
    });
}
exports.UserInfo = UserInfo;
function DoesUserExist_Email(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const matchCount = yield prisma.user.count({ where: { email: email } });
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
        const usrDetails = yield prisma.user.findUnique({
            where: {
                email: LoginInfo.email
            }
        });
        if (yield (0, argon2_1.verify)(usrDetails.password, LoginInfo.password)) {
            // TODO do some funky login info retaining shit, rn it doesn't do anything lol
            return true;
        }
        else {
            return false;
        }
    });
}
exports.VerifyLoginDetails = VerifyLoginDetails;
function SignUp(UserInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        let hashedPass = yield (0, argon2_1.hash)(UserInfo.password);
        yield prisma.user.create({
            data: {
                name: UserInfo.name,
                email: UserInfo.email,
                password: hashedPass,
                description: "",
                nationality: ""
            }
        });
        const UserID = yield prisma.user.findUnique({
            where: {
                email: UserInfo.email
            },
            select: { id: true }
        });
        return UserID;
    });
}
exports.SignUp = SignUp;
// (async () => await UserSearch("something"))() Wyatt wrote this
//# sourceMappingURL=prisma.js.map