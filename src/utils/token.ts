import { sign, verify } from "hono/jwt";
import { JwtTokenExpired } from "hono/utils/jwt/types";

const JWT_SECRET = Bun.env.JWT_SECRET || "your_super_secret_jwt_key";

export const createToken = async (payload: {
  userId: string;
  email: string;
}) => {
  const nowInSeconds = Math.floor(Date.now() / 1000);

  const twoHoursInSeconds = 2 * 60 * 60; // 7200 seconds

  // You can easily change this for other durations:
  // const twentyFourHoursInSeconds = 24 * 60 * 60; // 86400 seconds
  // const oneWeekInSeconds = 7 * 24 * 60 * 60; // 604800 seconds

  const expirationTimeInSeconds = nowInSeconds + twoHoursInSeconds;

  return await sign({ ...payload, exp: expirationTimeInSeconds }, JWT_SECRET);
};

export const validateToken = async (token: string) => {
  const payload = await verify(token, JWT_SECRET);

  if (payload instanceof JwtTokenExpired) {
    console.error("Token expired");
  }

  return payload;
};
