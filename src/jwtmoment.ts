import jwt from "jsonwebtoken";
import { redis } from "./databasing/redis";

const SecretKey = process.env.JWT_SECRET_KEY;

export async function getAccessToken(userid: string) {
  const AccessToken = jwt.sign(userid, SecretKey);
  return AccessToken;
}
