import { z } from "zod";
import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../lib/db";
import { TypedResponse } from "hono";
import { hashPassword, verifyPassword } from "../../utils/password";
import {
  AuthSuccessResponseSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  ErrorResponseSchema,
} from "./schema";
import { createToken } from "../../utils/token";

const API_TAGS = ["Authentication"];

const authRoutes = new OpenAPIHono();

// POST /login
authRoutes.openapi(
  {
    method: "post",
    path: "/login",
    summary: "User Login",
    description:
      "Authenticates a user with provided credentials (email and password) and returns an authentication token upon successful login.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: LoginRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Login successful. Returns an authentication token.",
        content: {
          "application/json": {
            schema: AuthSuccessResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized. Invalid credentials provided.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error. Failed to process login.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
    tags: API_TAGS,
  },
  async (c) => {
    try {
      const { email, password } = c.req.valid("json");

      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        return c.json(
          { message: "Invalid email or password.", code: 401 },
          401
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 401>;
      }

      const verified = await verifyPassword(password, user.passwordHash);

      if (!verified) {
        return c.json(
          { message: "Invalid email or password.", code: 401 },
          401
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 401>;
      }

      const token = await createToken({ userId: user.id, email: user.email });

      return c.json(
        {
          token: token,
          message: "Login successful.",
          userId: user.email,
        },
        200
      ) as TypedResponse<z.infer<typeof AuthSuccessResponseSchema>, 200>;
    } catch (error) {
      console.error("Login error:", error); // Log the actual error for debugging
      return c.json(
        {
          message: "Failed to process login due to an internal server error.",
          code: 500,
        },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

// POST /register
authRoutes.openapi(
  {
    method: "post",
    path: "/register",
    summary: "User Registration",
    description:
      "Registers a new user account with provided details (name, email, and password). Returns an authentication token upon successful registration.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: RegisterRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description:
          "Registration successful. Returns an authentication token.",
        content: {
          "application/json": {
            schema: AuthSuccessResponseSchema,
          },
        },
      },
      409: {
        description: "Conflict. User with this email already exists.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      400: {
        description: "Bad Request. Invalid input data.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error. Failed to process login.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
    tags: API_TAGS,
  },
  async (c) => {
    try {
      const { username, email, password } = c.req.valid("json");

      const emailIsExist = await prisma.user.findUnique({
        where: { email: email },
      });

      if (emailIsExist) {
        return c.json(
          { message: "Email already registered.", code: 409 },
          409
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 409>;
      }

      const usernameIsExist = await prisma.user.findUnique({
        where: { username: username },
      });

      if (usernameIsExist) {
        return c.json(
          { message: "Username already registered.", code: 409 },
          409
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 409>;
      }

      const hashedPassword = await hashPassword(password);
      const avatarUrl = `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${username}&size=64`;

      const newuser = await prisma.user.create({
        data: {
          username: username,
          email: email,
          passwordHash: hashedPassword,
          profilePicture: avatarUrl,
          bio: "about me",
        },
      });

      const token = await createToken({
        userId: newuser.id,
        email: newuser.email,
      });

      return c.json(
        {
          token: token,
          message: "Registration successful.",
          userId: newuser.id,
        },
        200
      ) as TypedResponse<z.infer<typeof AuthSuccessResponseSchema>, 200>;
    } catch (error) {
      console.error("Registration  error:", error);
      return c.json(
        {
          message: "Failed to process login due to an internal server error.",
          code: 500,
        },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

export { authRoutes };
