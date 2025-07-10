import { z } from "zod";
import { OpenAPIHono } from "@hono/zod-openapi";
import { TypedResponse } from "hono";
import prisma from "../../lib/db";
import {
  SpaceSchema,
  SpacesListResponseSchema,
  ErrorResponseSchema,
} from "./schema";

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
// spaceRoutes.openapi(
//   {
//     method: "post",
//     path: "/",
//     summary: "Create a new space",
//     description:
//       "Creates a new space entry in the system with the provided details.",
//     request: {
//       body: {
//         content: {
//           "application/json": {
//             schema: CreateSpaceRequestSchema,
//           },
//         },
//       },
//     },
//     responses: {
//       201: {
//         description: "Space created successfully.",
//         content: {
//           "application/json": {
//             schema: SpaceSchema,
//           },
//         },
//       },
//       400: {
//         description: "Invalid input data.",
//         content: {
//           "application/json": {
//             schema: ErrorResponseSchema,
//           },
//         },
//       },
//     },
//     tags: API_TAGS,
//     security: [
//       // Typically requires authentication
//       {
//         AuthorizationBearer: [],
//       },
//     ],
//   },
//   async (c) => {
//     const newSpaceData = await c.req.json();
//     const newSpace = {
//       id: `space-${Math.random().toString(36).substring(2, 11)}`, // Simple dummy ID
//       ...newSpaceData,
//       isAvailable: true, // Default new spaces to available
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };
//     DUMMY_SPACES.push(newSpace);
//     return c.json(newSpace, 201);
//   }
// );

// PUT /api/spaces/:id - Update an existing space
// spaceRoutes.openapi(
//   {
//     method: "put",
//     path: "/{id}",
//     summary: "Update an existing space",
//     description:
//       "Updates the details of an existing space identified by its unique ID.",
//     request: {
//       params: z.object({
//         id: z.string().uuid().openapi({
//           example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
//           description: "The unique identifier of the space to update.",
//         }),
//       }),
//       body: {
//         content: {
//           "application/json": {
//             schema: UpdateSpaceRequestSchema,
//           },
//         },
//       },
//     },
//     responses: {
//       200: {
//         description: "Space updated successfully.",
//         content: {
//           "application/json": {
//             schema: SpaceSchema,
//           },
//         },
//       },
//       404: {
//         description: "Space not found.",
//         content: {
//           "application/json": {
//             schema: ErrorResponseSchema,
//           },
//         },
//       },
//       400: {
//         description: "Invalid input data.",
//         content: {
//           "application/json": {
//             schema: ErrorResponseSchema,
//           },
//         },
//       },
//     },
//     tags: API_TAGS,
//     security: [
//       // Typically requires authentication
//       {
//         AuthorizationBearer: [],
//       },
//     ],
//   },
//   async (c) => {
//     const { id } = c.req.valid("param");
//     const updatedData = await c.req.json();
//     const spaceIndex = DUMMY_SPACES.findIndex((s) => s.id === id);

//     if (spaceIndex > -1) {
//       const updatedSpace = {
//         ...DUMMY_SPACES[spaceIndex],
//         ...updatedData,
//         updatedAt: new Date().toISOString(),
//       };
//       DUMMY_SPACES[spaceIndex] = updatedSpace;
//       return c.json(updatedSpace, 200);
//     } else {
//       return c.json({ message: "Space not found.", code: 404 }, 404);
//     }
//   }
// );

// DELETE /api/spaces/:id - Delete a space
// spaceRoutes.openapi(
//   {
//     method: "delete",
//     path: "/{id}",
//     summary: "Delete a space",
//     description: "Deletes a space from the system by its unique ID.",
//     request: {
//       params: z.object({
//         id: z.string().uuid().openapi({
//           example: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
//           description: "The unique identifier of the space to delete.",
//         }),
//       }),
//     },
//     responses: {
//       204: {
//         description: "Space deleted successfully (No Content).",
//       },
//       404: {
//         description: "Space not found.",
//         content: {
//           "application/json": {
//             schema: ErrorResponseSchema,
//           },
//         },
//       },
//     },
//     tags: API_TAGS,
//     security: [
//       // Typically requires authentication
//       {
//         AuthorizationBearer: [],
//       },
//     ],
//   },
//   async (c) => {
//     const { id } = c.req.valid("param");
//     const initialLength = DUMMY_SPACES.length;
//     DUMMY_SPACES = DUMMY_SPACES.filter((s) => s.id !== id);

//     if (DUMMY_SPACES.length < initialLength) {
//       return c.body(null, 204); // 204 No Content for successful deletion
//     } else {
//       return c.json({ message: "Space not found.", code: 404 }, 404);
//     }
//   }
// );

export { spaceRoutes };
