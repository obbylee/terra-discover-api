import { z } from "zod";

export const SpaceTypeSchema = z
  .object({
    id: z.string().openapi({
      example: "clxob8g8p000008jp8x1m9h5t",
      description: "Unique identifier for the space type.",
    }),
    name: z.string().openapi({
      example: "Park",
      description: "The name of the space type (e.g., 'Park', 'Plaza').",
    }),
    description: z.string().nullable().optional().openapi({
      example: "Public green space for recreation.",
      description: "Optional description of the space type.",
    }),
  })
  .openapi("SpaceType");

export const CreateSpaceTypeRequestSchema = z
  .object({
    name: z.string().min(1).openapi({
      example: "Museum",
      description: "The name of the new space type.",
    }),
    description: z.string().nullable().optional().openapi({
      example: "A building for exhibiting art or artifacts.",
      description: "Optional description for the new space type.",
    }),
  })
  .openapi("CreateSpaceTypeRequest");

export const UpdateSpaceTypeRequestSchema =
  CreateSpaceTypeRequestSchema.partial().openapi("UpdateSpaceTypeRequest", {
    description:
      "Schema for partially updating a space type. All fields are optional.",
  });

export const SpaceTypesListSchema = z
  .array(SpaceTypeSchema)
  .openapi("SpaceTypesList");

export const DeleteTypeSuccessSchema = z
  .object({
    message: z
      .string()
      .openapi({ example: "Space type deleted successfully." }),
  })
  .openapi("DeleteTypeSuccess");

export const ErrorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "An error occurred." }),
    code: z.number().int().openapi({ example: 500 }),
  })
  .openapi("ErrorResponse");
