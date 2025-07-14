import { z } from "zod";
import { TypedResponse } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../lib/db";

import {
  SpaceFeatureSchema,
  SpaceFeaturesListSchema,
  CreateSpaceFeatureRequestSchema,
  UpdateSpaceFeatureRequestSchema,
  ErrorResponseSchema,
  DeleteFeatureSuccessSchema,
} from "./schema";
import { authenticateUser } from "../../middlewares/auth";

const API_TAGS = ["Space Features"];

export const featureRoutes = new OpenAPIHono();

featureRoutes.openapi(
  {
    method: "get",
    path: "/",
    summary: "List all space features",
    description: "Retrieves a list of all available space features.",
    tags: API_TAGS,
    responses: {
      200: {
        description: "A list of space features.",
        content: {
          "application/json": {
            schema: SpaceFeaturesListSchema,
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
      const features = await prisma.spaceFeature.findMany();
      return c.json(features, 200) as TypedResponse<
        z.infer<typeof SpaceFeaturesListSchema>,
        200
      >;
    } catch (error) {
      console.error("Error fetching space features:", error);
      return c.json(
        { message: "Failed to retrieve space features.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

featureRoutes.openapi(
  {
    method: "get",
    path: "/{id}",
    summary: "Get a space feature by ID",
    description: "Retrieves a single space feature by its unique identifier.",
    tags: API_TAGS,
    request: {
      params: z.object({
        id: z.string().openapi({
          example: "f1a2b3c4",
          description: "The ID of the space feature.",
        }),
      }),
    },
    responses: {
      200: {
        description: "The requested space feature.",
        content: {
          "application/json": {
            schema: SpaceFeatureSchema,
          },
        },
      },
      404: {
        description: "Space feature not found.",
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
      const feature = await prisma.spaceFeature.findUnique({
        where: { id },
      });

      if (!feature) {
        return c.json(
          { message: "Space feature not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      return c.json(feature, 200) as TypedResponse<
        z.infer<typeof SpaceFeatureSchema>,
        200
      >;
    } catch (error) {
      console.error("Error fetching space feature:", error);
      return c.json(
        { message: "Failed to retrieve space feature.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

featureRoutes.openapi(
  {
    method: "post",
    path: "/",
    summary: "Create a new space feature",
    description: "Adds a new space feature to the system.",
    tags: API_TAGS,
    middleware: authenticateUser,
    security: [{ AuthorizationBearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateSpaceFeatureRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Space feature created successfully.",
        content: {
          "application/json": {
            schema: SpaceFeatureSchema,
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
        description: "Conflict. A feature with this name already exists.",
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
      const newFeature = await prisma.spaceFeature.create({
        data: payload,
      });
      return c.json(newFeature, 201) as TypedResponse<
        z.infer<typeof SpaceFeatureSchema>,
        201
      >;
    } catch (error) {
      console.error("Error creating space feature:", error);
      return c.json(
        { message: "Failed to create space feature.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

featureRoutes.openapi(
  {
    method: "patch",
    path: "/{id}",
    summary: "Partially update a space feature",
    description:
      "Applies a partial update to an existing space feature by its ID.",
    tags: API_TAGS,
    middleware: authenticateUser,
    security: [{ AuthorizationBearer: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({
          example: "f1a2b3c4",
          description: "The ID of the space feature to update.",
        }),
      }),
      body: {
        content: {
          "application/json": {
            schema: UpdateSpaceFeatureRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Space feature updated successfully.",
        content: {
          "application/json": {
            schema: SpaceFeatureSchema,
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
        description: "Space feature not found.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      409: {
        description:
          "Conflict. A feature with the provided name already exists.",
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

      const existingFeature = await prisma.spaceFeature.findUnique({
        where: { id: id },
      });

      if (!existingFeature) {
        return c.json(
          { message: "Space feature not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      const updatedFeature = await prisma.spaceFeature.update({
        where: { id: id },
        data: payload,
      });
      return c.json(updatedFeature, 200) as TypedResponse<
        z.infer<typeof SpaceFeatureSchema>,
        200
      >;
    } catch (error) {
      console.error("Error updating space feature:", error);
      return c.json(
        { message: "Failed to update space feature.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

featureRoutes.openapi(
  {
    method: "delete",
    path: "/{id}",
    summary: "Delete a space feature",
    description: "Deletes a space feature by its unique ID.",
    tags: API_TAGS,
    middleware: authenticateUser,
    security: [{ AuthorizationBearer: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({
          example: "f1a2b3c4",
          description: "The ID of the space feature to delete.",
        }),
      }),
    },
    responses: {
      200: {
        description: "Space feature deleted successfully.",
        content: {
          "application/json": {
            schema: DeleteFeatureSuccessSchema,
          },
        },
      },
      404: {
        description: "Space feature not found.",
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

      const existingFeature = await prisma.spaceFeature.findUnique({
        where: { id },
      });
      if (!existingFeature) {
        return c.json(
          { message: "Space feature not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      await prisma.spaceFeature.delete({
        where: { id: id },
      });
      return c.json(
        { message: "Space feature deleted successfully." },
        200
      ) as TypedResponse<z.infer<typeof DeleteFeatureSuccessSchema>, 200>;
    } catch (error) {
      console.error("Error deleting space feature:", error);
      return c.json(
        { message: "Failed to delete space feature.", code: 500 },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);
