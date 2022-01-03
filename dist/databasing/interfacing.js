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
class database_connection {
    Search(request) {
        return __awaiter(this, void 0, void 0, function* () {
            let matches = yield (0, prisma_1.UserSearch)(request).catch(e => {
                throw e;
            });
            return matches;
        });
    }
    GetUserInfo(user) {
        return __awaiter(this, void 0, void 0, function* () {
            let Info = yield (0, prisma_1.UserInfo)(user).catch(e => {
                throw e;
            });
            return Info;
        });
    }
    DoesUserExist(email) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield (0, prisma_1.DoesUserExist_Email)(email).catch(e => {
                throw e;
            });
            return result;
        });
    }
    UserSignUp(userInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userInfo.password === userInfo.passwordCheck) {
                let UserData = {
                    name: userInfo.firstname + " " + userInfo.surname,
                    email: userInfo.email,
                    password: userInfo.password
                };
                let uid = yield (0, prisma_1.SignUp)(UserData);
                return uid;
            }
            else {
                return false;
            }
        });
    }
}
exports.default = database_connection;
//# sourceMappingURL=interfacing.js.map