import { PrismaClient } from "@prisma/client";
import { UserType, LoginType } from "../types";
import { hash, verify } from "argon2";
import { mainModule } from "process";
const prisma = new PrismaClient();

export async function UserSearch(search: string) {
  //TODO fix this
  const name: string = search;
  const UserMatches = await prisma.user.findMany({
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
}

export async function UserInfo(reqid: string) {
  const UserInfo = await prisma.user.findUnique({
    where: {
      id: reqid
    },
    select: {
      name: true
    }
  });
  return UserInfo;
}

export async function DoesUserExist_Email(email: string) {
  const matchCount = await prisma.user.count({ where: { email: email } });
  if (matchCount > 0) {
    return true;
  } else {
    return false;
  }
}

export async function VerifyLoginDetails(LoginInfo: LoginType) {
  const usrDetails = await prisma.user.findUnique({
    where: {
      email: LoginInfo.email
    }
  });
  if (await verify(usrDetails.password, LoginInfo.password)) {
    // TODO do some funky login info retaining shit, rn it doesn't do anything lol
    return true;
  } else {
    return false;
  }
}

export async function SignUp(UserInfo: UserType) {
  let hashedPass = await hash(UserInfo.password);
  await prisma.user.create({
    data: {
      name: UserInfo.name,
      email: UserInfo.email,
      password: hashedPass,
      description: "",
      nationality: ""
    }
  });

  const UserID = await prisma.user.findUnique({
    where: {
      email: UserInfo.email
    },
    select: { id: true }
  });

  return UserID;
}

// (async () => await UserSearch("something"))() Wyatt wrote this
