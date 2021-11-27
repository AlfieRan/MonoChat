import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export interface User {
  name: string;
  email: string;
  password: string;
}

export async function UserSearch(Search: string) {
  const UserMatches = await prisma.user.findMany({
    where: {
      name: {
        contains: Search,
      },
    },
    // include: {
    //   author: true, // Return all fields
    // },
  });
  return UserMatches;
}

export async function SignUp(UserInfo: User) {
  await prisma.user.create({
    data: {
      name: UserInfo.name,
      email: UserInfo.email,
      Password: UserInfo.password,
    },
  });
}
