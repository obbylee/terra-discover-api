import { z } from "zod";
import { OpenAPIHono } from "@hono/zod-openapi";
import { TypedResponse } from "hono";
import { UsersListResponseSchema, ErrorResponseSchema } from "./schema";
import prisma from "../../lib/db";
import { SpacesListResponseSchema } from "../spaces/schema";

const API_TAGS = ["Users"];

const userRoutes = new OpenAPIHono();

userRoutes.openapi(
  {
    method: "get",
    path: "/",
    summary: "Retrieve a list of all users",
    description:
      "Fetches a complete list of all registered user profiles available in the system. This endpoint provides basic user information and is typically accessible to authenticated administrators or privileged users. The response includes an array of user objects.",
    responses: {
      200: {
        description: "Successful response with an array of user objects.",
        content: {
          "application/json": {
            schema: UsersListResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error. Failed to retrieve users.",
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
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          profilePicture: true,
          bio: true,
        },
      });
      return c.json(users, 200);
    } catch (error) {
      console.error("Error retrieving users:", error);
      return c.json(
        {
          message: "Failed to retrieve users due to an internal server error.",
          code: 500,
        },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

userRoutes.openapi(
  {
    method: "get",
    path: "/{identifier}/spaces",
    summary: "Retrieve spaces submitted by a user",
    description:
      "Fetches a list of all spaces submitted by a user, identified by their username or email.",
    request: {
      params: z.object({
        identifier: z.string().openapi({
          description: "Username or email of the user.",
          example: "john_doe",
        }),
      }),
    },
    responses: {
      200: {
        description:
          "SSuccessful response with a list of spaces submitted by the user.",
        content: {
          "application/json": {
            schema: SpacesListResponseSchema,
          },
        },
      },
      404: {
        description: "User not found or user has no submitted spaces.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error. Failed to retrieve users.",
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
      const { identifier } = c.req.valid("param");

      const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { username: identifier }] },
        select: { id: true },
      });

      if (!user) {
        return c.json(
          { message: "User not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      const spaces = await prisma.space.findMany({
        where: { submittedById: user.id },
        include: {
          categories: { select: { name: true } },
          features: { select: { name: true } },
          submittedBy: { select: { username: true } },
          type: { select: { name: true } },
        },
      });

      const formattedSpaces = spaces.map((space) => {
        return {
          ...space,
          categories: space.categories.map((category) => category.name),
          features: space.features.map((feature) => feature.name),
        };
      });

      return c.json(formattedSpaces) as TypedResponse<
        z.infer<typeof SpacesListResponseSchema>,
        200
      >;
    } catch (error) {
      console.error("Error fetching spaces:", error);
      return c.json(
        {
          message: "Failed to retrieve spaces due to an internal server error.",
          code: 500,
        },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

export { userRoutes };
