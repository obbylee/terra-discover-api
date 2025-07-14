import { z } from "zod";

export const SpaceFeatureSchema = z
  .object({
    id: z.string().openapi({
      example: "clxob8g8p000008jp8x1m9h5v",
      description: "Unique identifier for the space feature.",
    }),
    name: z.string().openapi({
      example: "Wi-Fi",
      description:
        "The name of the space feature (e.g., 'Wi-Fi', 'Playground').",
    }),
    description: z.string().nullable().optional().openapi({
      example: "Feature indicating internet access.",
      description: "Optional description of the space feature.",
    }),
  })
  .openapi("SpaceFeature");

export const SpaceFeaturesListSchema = z
  .array(SpaceFeatureSchema)
  .openapi("SpaceFeaturesList");

export const CreateSpaceFeatureRequestSchema = z
  .object({
    name: z.string().min(1).openapi({
      example: "Restrooms",
      description: "The name of the new space feature.",
    }),
    description: z.string().nullable().optional().openapi({
      example: "Feature indicating availability of public restrooms.",
      description: "Optional description for the new space feature.",
    }),
  })
  .openapi("CreateSpaceFeatureRequest");

export const UpdateSpaceFeatureRequestSchema =
  CreateSpaceFeatureRequestSchema.partial().openapi(
    "UpdateSpaceFeatureRequest",
    {
      description:
        "Schema for partially updating a space feature. All fields are optional.",
    }
  );

export const DeleteFeatureSuccessSchema = z
  .object({
    message: z
      .string()
      .openapi({ example: "Space feature deleted successfully." }),
  })
  .openapi("DeleteFeatureSuccess");

export const ErrorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "An error occurred." }),
    code: z.number().int().openapi({ example: 500 }),
  })
  .openapi("ErrorResponse");
