import { PrismaClient } from "@prisma/client";
import { UserType } from "../types";
import { mainModule } from "process";
const prisma = new PrismaClient();

export async function UserSearch(search: string) {
  const UserMatches = await prisma.user.findMany({
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

export async function SignUp(UserInfo: UserType) {
  await prisma.user.create({
    data: {
      name: UserInfo.name,
      email: UserInfo.email,
      Password: UserInfo.password,
      Description: "",
      Nationality: ""
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
