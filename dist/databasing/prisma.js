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
exports.SignUp = exports.UserInfo = exports.UserSearch = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function UserSearch(search) {
    return __awaiter(this, void 0, void 0, function* () {
        const UserMatches = yield prisma.user.findMany({
            where: {
                name: {
                    contains: search
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
function SignUp(UserInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.user.create({
            data: {
                name: UserInfo.name,
                email: UserInfo.email,
                Password: UserInfo.password,
                Description: "",
                Nationality: ""
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