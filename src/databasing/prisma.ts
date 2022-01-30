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

export async function UserInfo(usrId: string) {
  const UserInfo = await prisma.user.findUnique({
    where: {
      id: usrId
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
  const NewUser = await prisma.user.create({
    data: {
      name: UserInfo.name,
      email: UserInfo.email,
      password: hashedPass,
      description: "",
      nationality: ""
    }
  });

  return NewUser;
}

export async function GetChatMessages(ChatId: string) {
  const messages = await prisma.chat.findUnique({
    where: { id: ChatId },
    select: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true },
        take: 50
      }
    }
  });

  return messages;
}

export async function GetChatInfo(ChatId: string) {
  const info = await prisma.chat.findUnique({
    where: { id: ChatId },
    select: { chatname: true, memberIds: true }
  });
  return info;
}

export async function GetMessageInfo(MsgId: string) {
  const info = await prisma.message.findUnique({
    where: { id: MsgId },
    select: { content: true, userId: true, createdAt: true }
  });
  return info;
}

export async function sendMessage(
  ChatId: string,
  UserId: string,
  content: string
) {
  try {
    await prisma.chat.update({
      where: { id: ChatId },
      data: {
        messages: {
          create: {
            content: content,
            sender: { connect: { id: UserId } }
          }
        }
      }
    });
    return { successful: true };
  } catch (e) {
    return { successful: false, error: e };
  }
}

export async function isChatPublic(ChatId: string) {
  const isPublic = await prisma.chat.findUnique({
    where: {
      id: ChatId
    },
    select: {
      ispublic: true
    }
  });

  if (isPublic.ispublic) {
    return true;
  } else {
    return false;
  }
}

// (async () => await UserSearch("something"))() Wyatt wrote this
