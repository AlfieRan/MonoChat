import { PrismaClient } from "@prisma/client";
import { UserType, LoginType } from "../types";
import { hash, verify } from "argon2";
import { mainModule } from "process";
const prisma = new PrismaClient();

export async function UserSearch(search: string) {
  //TODO fix this
  const name: Array<string> = search.split(" ");
  const UserMatches = await prisma.user.findMany({
    where: {
      firstname: {
        contains: name[0]
      },
      surname: {
        contains: name[1]
      }
    },
    select: {
      id: true,
      firstname: true,
      surname: true
    }
  });
  return UserMatches;
}

export async function UserInfo(reqid: string) {
  const UserInfo = await prisma.user.findUnique({
    where: {
      id: reqid
    },
    select: {
      firstname: true,
      surname: true
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
      firstname: UserInfo.firstname,
      surname: UserInfo.surname,
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
