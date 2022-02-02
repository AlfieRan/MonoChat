import { serialize } from "cookie";
import { Request } from "express";
import { redis } from "./databasing/redis";

const cookieName = "_monochatses";

export async function getSession(req: Request): Promise<string> {
  console.log("a");
  const key = sessionKeyFromRequest(req);
  console.log("d");
  const result = await redis.get(`session:${key}`);
  console.log("e");
  if (!result) {
    console.log("f");
    throw new Error("You are not logged in");
  }

  return result;
}

export function sessionKeyFromRequest(req: Request): string {
  if (!req.cookies[cookieName]) {
    throw new Error("You are not logged in");
  }
  return req.cookies[cookieName];
}

export function generateCookie(key: string, expires: Date) {
  return serialize(cookieName, key, {
    httpOnly: true,
    // secure: process.env.NODE_ENV !== "development",
    secure: false,
    path: "/",
    sameSite: "strict",
    // sameSite: false,
    expires
  });
}
