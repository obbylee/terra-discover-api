import { z } from "zod";
import { TypedResponse } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../lib/db";

import {
  SpaceCategorySchema,
  SpaceCategoriesListSchema,
  CreateSpaceCategoryRequestSchema,
  UpdateSpaceCategoryRequestSchema,
  ErrorResponseSchema,
  DeleteCategorySuccessSchema,
} from "./schema";
import { authenticateUser } from "../../middlewares/auth";

const API_TAGS = ["Space Categories"];

export const categoryRoutes = new OpenAPIHono();

categoryRoutes.openapi(
  {
    method: "get",
    path: "/",
    summary: "List all space categories",
    description: "Retrieves a list of all available space categories.",
    tags: API_TAGS,
    responses: {
      200: {
        description: "A list of space categories.",
        content: {
          "application/json": {
            schema: SpaceCategoriesListSchema,
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
      const categories = await prisma.spaceCategory.findMany();
      return c.json(categories, 200) as TypedResponse<
        z.infer<typeof SpaceCategoriesListSchema>,
        200
      >;
    } catch (error) {
      console.error("Error fetching space categories:", error);
      return c.json(
        { message: "Failed to retrieve space categories.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

categoryRoutes.openapi(
  {
    method: "get",
    path: "/{id}",
    summary: "Get a space category by ID",
    description: "Retrieves a single space category by its unique identifier.",
    tags: API_TAGS,
    request: {
      params: z.object({
        id: z.string().openapi({
          example: "clxob8g8p000008jp8x1m9h5u",
          description: "The ID of the space category.",
        }),
      }),
    },
    responses: {
      200: {
        description: "The requested space category.",
        content: {
          "application/json": {
            schema: SpaceCategorySchema,
          },
        },
      },
      404: {
        description: "Space category not found.",
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
      const category = await prisma.spaceCategory.findUnique({
        where: { id },
      });

      if (!category) {
        return c.json(
          { message: "Space category not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      return c.json(category, 200) as TypedResponse<
        z.infer<typeof SpaceCategorySchema>,
        200
      >;
    } catch (error) {
      console.error("Error fetching space category:", error);
      return c.json(
        { message: "Failed to retrieve space category.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

categoryRoutes.openapi(
  {
    method: "post",
    path: "/",
    summary: "Create a new space category",
    description: "Adds a new space category to the system.",
    tags: API_TAGS,
    middleware: authenticateUser,
    security: [{ AuthorizationBearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateSpaceCategoryRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Space category created successfully.",
        content: {
          "application/json": {
            schema: SpaceCategorySchema,
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
        description: "Conflict. A category with this name already exists.",
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
      const newCategory = await prisma.spaceCategory.create({
        data: payload,
      });
      return c.json(newCategory, 201) as TypedResponse<
        z.infer<typeof SpaceCategorySchema>,
        201
      >;
    } catch (error) {
      console.error("Error creating space category:", error);
      return c.json(
        { message: "Failed to create space category.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

categoryRoutes.openapi(
  {
    method: "patch",
    path: "/{id}",
    summary: "Partially update a space category",
    description:
      "Applies a partial update to an existing space category by its ID.",
    tags: API_TAGS,
    middleware: authenticateUser,
    security: [{ AuthorizationBearer: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({
          example: "clxob8g8p000008jp8x1m9h5u",
          description: "The ID of the space category to update.",
        }),
      }),
      body: {
        content: {
          "application/json": {
            schema: UpdateSpaceCategoryRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Space category updated successfully.",
        content: {
          "application/json": {
            schema: SpaceCategorySchema,
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
        description: "Space category not found.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      409: {
        description:
          "Conflict. A category with the provided name already exists.",
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

      const existingCategory = await prisma.spaceCategory.findUnique({
        where: { id: id },
      });

      if (!existingCategory) {
        return c.json(
          { message: "Space category not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      const updatedCategory = await prisma.spaceCategory.update({
        where: { id: id },
        data: payload,
      });
      return c.json(updatedCategory, 200) as TypedResponse<
        z.infer<typeof SpaceCategorySchema>,
        200
      >;
    } catch (error) {
      console.error("Error updating space category:", error);
      return c.json(
        { message: "Failed to update space category.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

categoryRoutes.openapi(
  {
    method: "delete",
    path: "/{id}",
    summary: "Delete a space category",
    description: "Deletes a space category by its unique ID.",
    tags: API_TAGS,
    middleware: authenticateUser,
    security: [{ AuthorizationBearer: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({
          example: "clxob8g8p000008jp8x1m9h5u",
          description: "The ID of the space category to delete.",
        }),
      }),
    },
    responses: {
      200: {
        description: "Space category deleted successfully.",
        content: {
          "application/json": {
            schema: DeleteCategorySuccessSchema,
          },
        },
      },
      404: {
        description: "Space category not found.",
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

      const existingCategory = await prisma.spaceCategory.findUnique({
        where: { id },
      });
      if (!existingCategory) {
        return c.json(
          { message: "Space category not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      await prisma.spaceCategory.delete({
        where: { id: id },
      });
      return c.json(
        { message: "Space category deleted successfully." },
        200
      ) as TypedResponse<z.infer<typeof DeleteCategorySuccessSchema>, 200>;
    } catch (error) {
      console.error("Error deleting space category:", error);
      return c.json(
        { message: "Failed to delete space category.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);
