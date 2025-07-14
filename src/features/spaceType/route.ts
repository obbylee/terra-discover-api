import { z } from "zod";
import { TypedResponse } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../lib/db";

import {
  SpaceTypeSchema,
  SpaceTypesListSchema,
  CreateSpaceTypeRequestSchema,
  UpdateSpaceTypeRequestSchema,
  ErrorResponseSchema,
  DeleteTypeSuccessSchema,
} from "./schema";
import { authenticateUser } from "../../middlewares/auth";

const API_TAGS = ["Space Types"];

export const typeRoutes = new OpenAPIHono();

typeRoutes.openapi(
  {
    method: "get",
    path: "/",
    summary: "List all space types",
    description: "Retrieves a list of all available space types.",
    tags: API_TAGS,
    responses: {
      200: {
        description: "A list of space types.",
        content: {
          "application/json": {
            schema: SpaceTypesListSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  },
  async (c) => {
    try {
      const types = await prisma.spaceType.findMany();
      return c.json(types, 200) as TypedResponse<
        z.infer<typeof SpaceTypesListSchema>,
        200
      >;
    } catch (error) {
      console.error("Error fetching space types:", error);
      return c.json(
        { message: "Failed to retrieve space types.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

typeRoutes.openapi(
  {
    method: "get",
    path: "/{id}",
    summary: "Get a space type by ID",
    description: "Retrieves a single space type by its unique identifier.",
    tags: API_TAGS,
    request: {
      params: z.object({
        id: z.string().openapi({
          example: "clxob8g8p000008jp8x1m9h5t",
          description: "The ID of the space type.",
        }),
      }),
    },
    responses: {
      200: {
        description: "The requested space type.",
        content: {
          "application/json": {
            schema: SpaceTypeSchema,
          },
        },
      },
      404: {
        description: "Space type not found.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  },
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const type = await prisma.spaceType.findUnique({
        where: { id },
      });

      if (!type) {
        return c.json(
          { message: "Space type not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      return c.json(type, 200) as TypedResponse<
        z.infer<typeof SpaceTypeSchema>,
        200
      >;
    } catch (error) {
      console.error("Error fetching space type:", error);
      return c.json(
        { message: "Failed to retrieve space type.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

typeRoutes.openapi(
  {
    method: "post",
    path: "/",
    summary: "Create a new space type",
    description: "Adds a new space type to the system.",
    tags: API_TAGS,
    middleware: authenticateUser,
    security: [{ AuthorizationBearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateSpaceTypeRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Space type created successfully.",
        content: {
          "application/json": {
            schema: SpaceTypeSchema,
          },
        },
      },
      400: {
        description: "Invalid input data.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      409: {
        description: "Conflict. A type with this name already exists.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  },
  async (c) => {
    try {
      const payload = c.req.valid("json");
      const newType = await prisma.spaceType.create({
        data: payload,
      });
      return c.json(newType, 201) as TypedResponse<
        z.infer<typeof SpaceTypeSchema>,
        201
      >;
    } catch (error) {
      console.error("Error creating space type:", error);

      return c.json(
        { message: "Failed to create space type.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

typeRoutes.openapi(
  {
    method: "patch",
    path: "/{id}",
    summary: "Partially update a space type",
    description:
      "Applies a partial update to an existing space type by its ID.",
    tags: API_TAGS,
    middleware: authenticateUser,
    security: [{ AuthorizationBearer: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({
          example: "clxob8g8p000008jp8x1m9h5t",
          description: "The ID of the space type to update.",
        }),
      }),
      body: {
        content: {
          "application/json": {
            schema: UpdateSpaceTypeRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Space type updated successfully.",
        content: {
          "application/json": {
            schema: SpaceTypeSchema,
          },
        },
      },
      400: {
        description: "Invalid input data.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: "Space type not found.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      409: {
        description: "Conflict. A type with the provided name already exists.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  },
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const payload = c.req.valid("json");

      const existingType = await prisma.spaceType.findUnique({
        where: { id: id },
      });

      if (!existingType) {
        return c.json(
          { message: "Space type not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      const updatedType = await prisma.spaceType.update({
        where: { id: id },
        data: payload,
      });
      return c.json(updatedType, 200) as TypedResponse<
        z.infer<typeof SpaceTypeSchema>,
        200
      >;
    } catch (error) {
      console.error("Error updating space type:", error);

      return c.json(
        { message: "Failed to update space type.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

typeRoutes.openapi(
  {
    method: "delete",
    path: "/{id}",
    summary: "Delete a space type",
    description: "Deletes a space type by its unique ID.",
    tags: API_TAGS,
    middleware: authenticateUser,
    security: [{ AuthorizationBearer: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({
          example: "clxob8g8p000008jp8x1m9h5t",
          description: "The ID of the space type to delete.",
        }),
      }),
    },
    responses: {
      200: {
        description: "Space type deleted successfully.",
        content: {
          "application/json": {
            schema: DeleteTypeSuccessSchema,
          },
        },
      },
      404: {
        description: "Space type not found.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  },
  async (c) => {
    try {
      const { id } = c.req.valid("param");

      const existingType = await prisma.spaceType.findUnique({
        where: { id },
      });
      if (!existingType) {
        return c.json(
          { message: "Space type not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      await prisma.spaceType.delete({
        where: { id: id },
      });
      return c.json(
        { message: "Space type deleted successfully." },
        200
      ) as TypedResponse<z.infer<typeof DeleteTypeSuccessSchema>, 200>;
    } catch (error) {
      console.error("Error deleting space type:", error);
      return c.json(
        { message: "Failed to delete space type.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);
