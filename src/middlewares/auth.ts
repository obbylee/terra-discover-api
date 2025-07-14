import { createMiddleware } from "hono/factory";
import prisma from "../lib/db";
import { verify } from "hono/jwt";

const JWT_SECRET = Bun.env.JWT_SECRET || "your_super_secret_jwt_key";

type Env = {
  Variables: {
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
};

export const authenticateUser = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        message:
          "Authentication required: Invalid or missing Authorization header.",
        code: 401,
      },
      401
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, JWT_SECRET);

    if (
      !payload ||
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string"
    ) {
      throw new Error("Invalid token payload structure.");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: { id: true, username: true, email: true },
    });

    if (!user) {
      return c.json(
        {
          message: "Authentication failed: User not found.",
          code: 401,
        },
        401
      );
    }

    c.set("user", {
      id: user.id,
      username: user.username,
      email: user.email,
    });

    await next();
  } catch (error: any) {
    console.error("Authentication middleware error:", error.message);
    let message = "Authentication failed: Invalid token.";
    let statusCode = 401;

    if (error.name === "TokenExpiredError") {
      message = "Authentication failed: Token expired.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Authentication failed: Invalid token.";
    }

    return c.json(
      {
        message: message,
        code: statusCode,
      },
      401
    );
  }
});
