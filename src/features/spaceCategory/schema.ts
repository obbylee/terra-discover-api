import { z } from "zod";

export const SpaceCategorySchema = z
  .object({
    id: z.string().openapi({
      example: "clxob8g8p000008jp8x1m9h5u",
      description: "Unique identifier for the space category.",
    }),
    name: z.string().openapi({
      example: "Historical",
      description:
        "The name of the space category (e.g., 'Historical', 'Recreational').",
    }),
    description: z.string().nullable().optional().openapi({
      example: "Category for spaces with historical significance.",
      description: "Optional description of the space category.",
    }),
  })
  .openapi("SpaceCategory");

export const SpaceCategoriesListSchema = z
  .array(SpaceCategorySchema)
  .openapi("SpaceCategoriesList");

export const CreateSpaceCategoryRequestSchema = z
  .object({
    name: z.string().min(1).openapi({
      example: "Educational",
      description: "The name of the new space category.",
    }),
    description: z.string().nullable().optional().openapi({
      example: "Category for spaces focused on learning.",
      description: "Optional description for the new space category.",
    }),
  })
  .openapi("CreateSpaceCategoryRequest");

export const UpdateSpaceCategoryRequestSchema =
  CreateSpaceCategoryRequestSchema.partial().openapi(
    "UpdateSpaceCategoryRequest",
    {
      description:
        "Schema for partially updating a space category. All fields are optional.",
    }
  );

export const DeleteCategorySuccessSchema = z
  .object({
    message: z
      .string()
      .openapi({ example: "Space category deleted successfully." }),
  })
  .openapi("DeleteCategorySuccess");

export const ErrorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "An error occurred." }),
    code: z.number().int().openapi({ example: 500 }),
  })
  .openapi("ErrorResponse");
