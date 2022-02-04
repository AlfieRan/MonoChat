import { serialize } from "cookie";
import { Request } from "express";
import { redis } from "./databasing/redis";

const cookieName = "_monochatses";

export async function getSession(
  req: Request
): Promise<{ successful: boolean; data: string }> {
  const key = sessionKeyFromRequest(req);
  if (key.successful) {
    const result = await redis.get(`session:${key.data}`);
    if (!result) {
      return null;
    }
    return { successful: true, data: result };
  } else {
    return { successful: false, data: key.data };
  }
}

export function sessionKeyFromRequest(
  req: Request
): { successful: boolean; data: string } {
  if (!req.cookies[cookieName]) {
    return { successful: false, data: "You are not logged in" };
  }
  return { successful: true, data: req.cookies[cookieName] };
}

export function generateCookie(key: string, expires: Date) {
  return serialize(cookieName, key, {
    httpOnly: true,
    sameSite: "none",
    // secure: process.env.NODE_ENV !== "development",
    secure: true,
    path: "/",
    // sameSite: "strict",
    // sameSite: false,
    expires
  });
}
