import { z } from "zod";
import { OpenAPIHono } from "@hono/zod-openapi";
import { TypedResponse } from "hono";
import prisma from "../../lib/db";
import {
  SpaceSchema,
  SpacesListResponseSchema,
  CreateSpaceRequestSchema,
  ErrorResponseSchema,
  UpdateSpaceRequestSchema,
} from "./schema";
import { authenticateUser } from "../../middlewares/auth";
import { ensureUniqueSlug } from "../../utils/generateSlug";
import { PrismaClientKnownRequestError } from "../../generated/prisma/runtime/library";

const API_TAGS = ["Spaces"];

const spaceRoutes = new OpenAPIHono();

// GET /api/spaces - Get all spaces
spaceRoutes.openapi(
  {
    method: "get",
    path: "/",
    summary: "Retrieve all spaces",
    description:
      "Fetches a comprehensive list of all available spaces in the system.",
    responses: {
      200: {
        description: "Successful response with a list of spaces.",
        content: {
          "application/json": {
            schema: SpacesListResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error. Failed to retrieve spaces.",
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
      const spaces = await prisma.space.findMany({
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

// GET /api/spaces/:identifier - Get a single space by ID or Slug
spaceRoutes.openapi(
  {
    method: "get",
    path: "/{identifier}",
    summary: "Retrieve a space by ID or Slug",
    description:
      "Fetches detailed information for a single space specified by its unique ID or its URL-friendly slug.",
    request: {
      params: z.object({
        identifier: z.string().openapi({
          example: "taman-bungkul",
          description: "The unique identifier of the space.",
        }),
      }),
    },
    responses: {
      200: {
        description: "Successful response with the space details.",
        content: {
          "application/json": {
            schema: SpaceSchema,
          },
        },
      },
      404: {
        description: "Space not found.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error. Failed to retrieve spaces.",
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

      const space = await prisma.space.findFirst({
        where: { OR: [{ id: identifier }, { slug: identifier }] },
        include: {
          categories: { select: { name: true } },
          features: { select: { name: true } },
          submittedBy: { select: { username: true } },
          type: { select: { name: true } },
        },
      });

      if (!space) {
        return c.json(
          { message: "Space not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      const { categories, features, ...rest } = space;
      const formattedSpaces = {
        ...rest,
        categories: space.categories.map((category) => category.name),
        features: space.features.map((feature) => feature.name),
      };

      return c.json(formattedSpaces, 200) as TypedResponse<
        z.infer<typeof SpaceSchema>,
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

// POST /api/spaces - Create a new space
spaceRoutes.openapi(
  {
    method: "post",
    path: "/",
    summary: "Create a new space",
    description:
      "Creates a new space entry in the system with the provided details.",
    middleware: authenticateUser,
    request: {
      body: {
        content: {
          "application/json": {
            schema: CreateSpaceRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Space created successfully.",
        content: {
          "application/json": {
            schema: SpaceSchema,
          },
        },
      },
      400: {
        description: "Invalid input data or missing required relationships.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: "Related resource (Type, Category, or Feature) not found.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error. Failed to create space.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
    tags: API_TAGS,
    security: [
      {
        AuthorizationBearer: [],
      },
    ],
  },
  async (c) => {
    try {
      const authenticatedUser = c.get("user");
      const payload = c.req.valid("json");

      const { name, typeId, categoryIds, featureIds, ...spaceData } = payload;

      const typeExist = await prisma.spaceType.findUnique({
        where: { id: typeId },
      });

      if (!typeExist) {
        return c.json(
          { message: `Space Type with ID '${typeId}' not found.`, code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      if (categoryIds && categoryIds.length > 0) {
        const foundCategories = await prisma.spaceCategory.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true },
        });
        if (foundCategories.length !== categoryIds.length) {
          const foundIds = new Set(foundCategories.map((c) => c.id));
          const missingIds = categoryIds.filter((id) => !foundIds.has(id));
          return c.json(
            {
              message: `One or more Category IDs not found: ${missingIds.join(", ")}.`,
              code: 404,
            },
            404
          ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
        }
      }

      if (featureIds && featureIds.length > 0) {
        const foundFeatures = await prisma.spaceFeature.findMany({
          where: { id: { in: featureIds } },
          select: { id: true },
        });
        if (foundFeatures.length !== featureIds.length) {
          const foundIds = new Set(foundFeatures.map((f) => f.id));
          const missingIds = featureIds.filter((id) => !foundIds.has(id));
          return c.json(
            {
              message: `One or more Feature IDs not found: ${missingIds.join(", ")}.`,
              code: 404,
            },
            404
          ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
        }
      }

      const slug = await ensureUniqueSlug(name);

      const space = await prisma.space.create({
        data: {
          name,
          slug,
          ...spaceData,
          description: spaceData.description || "",
          submittedBy: {
            connect: { id: authenticatedUser.id },
          },
          type: {
            connect: { id: typeId },
          },
          categories: {
            connect: categoryIds?.map((id) => ({ id })) || [],
          },
          features: {
            connect: featureIds?.map((id) => ({ id })) || [],
          },
        },
        include: {
          categories: { select: { name: true } },
          features: { select: { name: true } },
        },
      });

      const formattedSpace = {
        ...space,
        categories: space.categories.map((category) => category.name),
        features: space.features.map((feature) => feature.name),
      };

      return c.json(formattedSpace, 201) as TypedResponse<
        z.infer<typeof SpaceSchema>,
        201
      >;
    } catch (error) {
      console.error("Error creating space:", error);
      return c.json(
        {
          message: "Failed to create space due to an internal server error.",
          code: 500,
        },
        500
      ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 500>;
    }
  }
);

// PATCH /api/spaces/:id - Update an existing space
spaceRoutes.openapi(
  {
    method: "patch",
    path: "/{identifier}",
    summary: "Partially update an existing space",
    description:
      "Applies a partial update to the details of an existing space identified by its unique ID or slug. Only the fields provided in the request body will be modified.",
    middleware: authenticateUser,
    request: {
      params: z.object({
        identifier: z.string().openapi({
          example: "taman-bungkul",
          description: "The unique identifier of the space.",
        }),
      }),
      body: {
        content: {
          "application/json": {
            schema: UpdateSpaceRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Space updated successfully.",
        content: {
          "application/json": {
            schema: SpaceSchema,
          },
        },
      },
      400: {
        description: "Invalid input data or missing required relationships.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      403: {
        description: "Forbidden. User does not have permission.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: "Space not found or related resource not found.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      409: {
        description: "Conflict. A space with the provided slug already exists.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error. Failed to update space.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
    tags: API_TAGS,
    security: [
      {
        AuthorizationBearer: [],
      },
    ],
  },
  async (c) => {
    try {
      const { identifier } = c.req.valid("param");
      const authenticatedUser = c.get("user");
      const payload = c.req.valid("json");

      // Find the space to update by ID or slug
      const existingSpace = await prisma.space.findFirst({
        where: {
          OR: [{ id: identifier }, { slug: identifier }],
        },
        select: { id: true, submittedById: true, name: true, typeId: true },
      });

      if (!existingSpace) {
        return c.json(
          { message: "Space not found.", code: 404 },
          404
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
      }

      // Authorization check - only allow the submitter to update their space
      if (existingSpace.submittedById !== authenticatedUser.id) {
        return c.json(
          {
            message:
              "Forbidden: You do not have permission to update this space.",
            code: 403,
          },
          403
        ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 403>;
      }

      // Prepare data for update, handling slug and relations
      const updateData: any = {};

      // Copy scalar fields from payload if they exist, except relational IDs
      for (const key_str in payload) {
        // Assert that 'key_str' is a valid key of 'payload'
        const key = key_str as keyof typeof payload;

        // Exclude specific relational ID fields from direct assignment, they're handled below
        if (key === "typeId" || key === "categoryIds" || key === "featureIds") {
          continue;
        }
        // Only assign if the key exists in payload (for PATCH semantics)
        if (payload[key] !== undefined) {
          updateData[key] = payload[key];
        }
      }

      // Handle name/slug update
      if (payload.name !== undefined && payload.name !== existingSpace.name) {
        const newSlug = await ensureUniqueSlug(payload.name);
        updateData.slug = newSlug;
      }

      // Handle typeId update: only if provided in payload
      if (payload.typeId !== undefined) {
        const typeExist = await prisma.spaceType.findUnique({
          where: { id: payload.typeId },
        });
        if (!typeExist) {
          return c.json(
            {
              message: `Space Type with ID '${payload.typeId}' not found.`,
              code: 404,
            },
            404
          ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
        }
        updateData.type = { connect: { id: payload.typeId } };
      }

      // Handle categories update (set operation replaces all existing with new list)
      if (payload.categoryIds !== undefined) {
        // Check if categoryIds was explicitly sent
        if (payload.categoryIds && payload.categoryIds.length > 0) {
          // Only validate if array is not empty
          const foundCategories = await prisma.spaceCategory.findMany({
            where: { id: { in: payload.categoryIds } },
            select: { id: true },
          });
          if (foundCategories.length !== payload.categoryIds.length) {
            const foundIds = new Set(foundCategories.map((c) => c.id));
            const missingIds = payload.categoryIds.filter(
              (id) => !foundIds.has(id)
            );
            return c.json(
              {
                message: `One or more Category IDs not found: ${missingIds.join(", ")}.`,
                code: 404,
              },
              404
            ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
          }
        }
        updateData.categories = {
          set: payload.categoryIds.map((id) => ({ id })),
        };
      }

      // Handle features update (set operation replaces all existing with new list)
      if (payload.featureIds !== undefined) {
        // Check if featureIds was explicitly sent
        if (payload.featureIds && payload.featureIds.length > 0) {
          // Only validate if array is not empty
          const foundFeatures = await prisma.spaceFeature.findMany({
            where: { id: { in: payload.featureIds } },
            select: { id: true },
          });
          if (foundFeatures.length !== payload.featureIds.length) {
            const foundIds = new Set(foundFeatures.map((f) => f.id));
            const missingIds = payload.featureIds.filter(
              (id) => !foundIds.has(id)
            );
            return c.json(
              {
                message: `One or more Feature IDs not found: ${missingIds.join(", ")}.`,
                code: 404,
              },
              404
            ) as TypedResponse<z.infer<typeof ErrorResponseSchema>, 404>;
          }
        }
        updateData.features = { set: payload.featureIds.map((id) => ({ id })) };
      }

      if (
        "description" in payload &&
        (payload.description === null || payload.description === undefined)
      ) {
        updateData.description = ""; // Default to empty string if nullable in schema but non-nullable in DB
      }

      const updatedSpace = await prisma.space.update({
        where: {
          id: existingSpace.id,
        },
        data: updateData,
        include: {
          categories: { select: { name: true } },
          features: { select: { name: true } },
        },
      });

      const formattedSpace = {
        ...updatedSpace,
        categories: updatedSpace.categories.map((category) => category.name),
        features: updatedSpace.features.map((feature) => feature.name),
      };

      return c.json(formattedSpace, 200) as TypedResponse<
        z.infer<typeof SpaceSchema>,
        200
      >;
    } catch (error) {
      let statusCode: 400 | 403 | 404 | 409 | 500 = 500;
      let errorMessage =
        "Failed to update space due to an internal server error.";

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // Unique constraint violation (e.g., slug conflict)
          errorMessage = "A space with this name or slug already exists.";
          statusCode = 409;
        } else if (error.code === "P2025") {
          // Record not found (e.g., connect to non-existent ID)
          errorMessage =
            "One or more related records (type, category, feature) not found.";
          statusCode = 404;
        } else {
          console.error(
            "Prisma client known error:",
            error.code,
            error.message
          );
          errorMessage = "Database operation failed unexpectedly.";
          statusCode = 500;
        }
      } else if (error instanceof Error) {
        if (error.message.includes("Forbidden")) {
          errorMessage = error.message;
          statusCode = 403;
        } else if (error.message.includes("not found")) {
          // This might be caught earlier by explicit 404s, but good fallback
          errorMessage = error.message;
          statusCode = 404;
        } else if (
          error.message.includes("Validation error") ||
          error.message.includes("Invalid input")
        ) {
          // Catch Zod/Hono validation errors
          errorMessage = "Invalid input data provided.";
          statusCode = 400;
        } else {
          console.error("Generic Error caught:", error.message, error.stack);
          errorMessage = "An unexpected server error occurred.";
          statusCode = 500;
        }
      } else {
        console.error("Unknown error caught:", error);
        errorMessage = "An entirely unexpected error occurred.";
        statusCode = 500;
      }

      return c.json(
        {
          message: errorMessage,
          code: statusCode,
        },
        statusCode
      ) as TypedResponse<
        z.infer<typeof ErrorResponseSchema>,
        typeof statusCode
      >;
    }
  }
);

// DELETE /api/spaces/:id - Delete a space
spaceRoutes.openapi(
  {
    method: "delete",
    path: "/{id}",
    summary: "Delete a space",
    description:
      "Deletes a space from the system by its unique ID. Only the user who submitted the space can delete it.",
    middleware: authenticateUser,
    request: {
      params: z.object({
        id: z.string().openapi({
          example: "cmd2mc9vq000pv3i4tuoj9j9l",
          description: "The unique identifier of the space to delete.",
        }),
      }),
    },
    responses: {
      204: {
        description: "Space deleted successfully (No Content).",
      },
      403: {
        description:
          "Forbidden. User does not have permission to delete this space.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      404: {
        description: "Space not found.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error. Failed to delete space.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
    tags: API_TAGS,
    security: [
      {
        AuthorizationBearer: [],
      },
    ],
  },
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const authenticatedUser = c.get("user");

      if (!authenticatedUser) {
        return c.json({ message: "Authentication required.", code: 401 }, 401);
      }

      const spaceToDelete = await prisma.space.findUnique({
        where: { id: id },
        select: { id: true, submittedById: true },
      });

      if (!spaceToDelete) {
        return c.json({ message: "Space not found.", code: 404 }, 404);
      }

      if (spaceToDelete.submittedById !== authenticatedUser.id) {
        return c.json(
          {
            message:
              "Forbidden: You do not have permission to delete this space.",
            code: 403,
          },
          403
        );
      }

      await prisma.space.delete({
        where: { id: id },
      });

      return c.body(null, 204);
    } catch (error) {
      console.error("Error deleting space:", error);

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return c.json({ message: "Space not found.", code: 404 }, 404);
        }
      }

      return c.json(
        {
          message: "Failed to delete space due to an internal server error.",
          code: 500,
        },
        500
      );
    }
  }
);

export { spaceRoutes };
