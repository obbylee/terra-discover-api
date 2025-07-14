import { z } from "zod";

const JsonValueSchema = z
  .any()
  .nullable()
  .optional()
  .openapi("JsonValue", {
    type: "object",
    description: "Arbitrary JSON object, can be null or absent.",
    example: { key: "value", anotherKey: 123 },
  });

export const SpaceSchema = z
  .object({
    id: z.string().openapi({
      example: "cmcvyolex000gv3ik8qxx701q",
      description: "Unique identifier for the space.",
    }),
    name: z.string().openapi({
      example: "Taman Bungkul",
      description: "The primary name of the space.",
    }),
    slug: z.string().openapi({
      example: "taman-bungkul",
      description:
        "Unique URL-friendly slug for the space, derived from the name.",
    }),
    alternateNames: z
      .array(z.string())
      .optional()
      .openapi({
        example: ["Bungkul Park", "Bungkul City Park"],
        description:
          "Other names by which the space is known. Can be empty or absent.",
      }),
    description: z.string().nullable().optional().openapi({
      example:
        "A vibrant urban park in Surabaya, known for its various community activities.",
      description: "Detailed description of the space. Can be null or absent.",
    }),
    activities: z
      .array(z.string())
      .optional()
      .openapi({
        example: ["picnic", "jogging", "cultural events"],
        description:
          "List of activities available at the space. Can be empty or absent.",
      }),
    historicalContext: z.string().nullable().optional().openapi({
      example:
        "Originally established as a cemetery in the Dutch colonial era.",
      description:
        "Historical significance or background of the space. Can be null or absent.",
    }),
    architecturalStyle: z.string().nullable().optional().openapi({
      example: "Modern minimalist with traditional Javanese elements",
      description:
        "Architectural style of the space's notable structures. Can be null or absent.",
    }),
    operatingHours: JsonValueSchema.openapi({
      example: { weekdays: "08:00-22:00", weekends: "07:00-23:00" },
      description: "Operating hours in a flexible JSON format.",
    }),
    entranceFee: JsonValueSchema.openapi({
      example: { amount: 0, currency: "IDR", notes: "Free entry for all" },
      description: "Information about entrance fees in JSON format.",
    }),
    contactInfo: JsonValueSchema.openapi({
      example: {
        phone: "+62311234567",
        email: "info@tamanbungkul.id",
        website: "https://example.com",
      },
      description: "Contact information in JSON format.",
    }),
    accessibility: JsonValueSchema.openapi({
      example: {
        wheelchair_accessible: true,
        parking: "available",
        restrooms: "accessible",
      },
      description: "Accessibility information in JSON format.",
    }),
    createdAt: z.string().datetime().openapi({
      example: "2024-07-08T14:30:00Z",
      description:
        "Timestamp when the space record was created (ISO 8601 format).",
    }),
    updatedAt: z.string().datetime().openapi({
      example: "2024-07-08T14:30:00Z",
      description:
        "Timestamp when the space record was last updated (ISO 8601 format).",
    }),
    typeId: z.string().openapi({
      example: "clxob8g8p000008jp8x1m9h5t",
      description: "ID of the associated SpaceType (e.g., 'Park', 'Museum').",
    }),
    submittedById: z.string().openapi({
      example: "clxob8g8p000008jp8x1m9h5u",
      description: "ID of the User who submitted this space.",
    }),
    categories: z.array(z.string()).openapi({
      example: ["Park", "Historical"],
      description: "List of names of associated SpaceCategories.",
    }),
    features: z.array(z.string()).openapi({
      example: ["Wi-Fi", "Playground"],
      description: "List of names of associated SpaceFeatures.",
    }),
  })
  .openapi("Space");

export const SpacesListResponseSchema = z
  .array(SpaceSchema)
  .openapi("SpacesListResponse", {
    example: [
      {
        id: "clxob8g8p000008jp8x1m9h5v",
        name: "Taman Bungkul",
        slug: "taman-bungkul",
        alternateNames: ["Bungkul Park"],
        description:
          "A popular urban park in Surabaya, known for its various community activities.",
        activities: ["picnic", "jogging", "cultural events"],
        historicalContext:
          "Originally established as a cemetery in the Dutch colonial era.",
        architecturalStyle: "Modern minimalist",
        operatingHours: { daily: "24/7" },
        entranceFee: { amount: 0, currency: "IDR" },
        contactInfo: { phone: "+62315678900" },
        accessibility: { wheelchair_accessible: true },
        createdAt: "2024-07-01T10:00:00Z",
        updatedAt: "2024-07-01T10:00:00Z",
        typeId: "clxob8g8p000008jp8x1m9h5t",
        submittedById: "clxob8g8p000008jp8x1m9h5u",
        categories: ["Park", "Historical"],
        features: ["Wi-Fi", "Restrooms"],
      },
      {
        id: "clxob8g8p000108jp8x1m9h5w",
        name: "Surabaya Zoo",
        slug: "surabaya-zoo",
        alternateNames: ["Kebun Binatang Surabaya"],
        description: "One of the oldest zoos in Southeast Asia.",
        activities: ["animal viewing", "education"],
        historicalContext: "Founded in 1916.",
        architecturalStyle: null,
        operatingHours: { daily: "08:00-16:00" },
        entranceFee: { amount: 15000, currency: "IDR" },
        contactInfo: { phone: "+62312345678" },
        accessibility: { wheelchair_accessible: false },
        createdAt: "2024-06-15T09:00:00Z",
        updatedAt: "2024-07-07T11:00:00Z",
        typeId: "clxob8g8p000008jp8x1m9h5v",
        submittedById: "clxob8g8p000008jp8x1m9h5x",
        categories: ["Zoo", "Educational"],
        features: ["Food Stalls"],
      },
    ],
  });

export const CreateSpaceRequestSchema = z
  .object({
    name: z.string().min(1).openapi({
      example: "New Park Name",
      description: "The primary name of the space.",
    }),
    alternateNames: z
      .array(z.string())
      .optional()
      .openapi({
        example: ["Park A"],
        description: "Other names by which the space is known.",
      }),
    description: z.string().nullable().optional().openapi({
      example: "A new park.",
      description: "Detailed description of the space.",
    }),
    activities: z
      .array(z.string())
      .optional()
      .openapi({
        example: ["walking"],
        description: "List of activities available at the space.",
      }),
    historicalContext: z.string().nullable().optional().openapi({
      example: "New history.",
      description: "Historical significance or background.",
    }),
    architecturalStyle: z.string().nullable().optional().openapi({
      example: "Modern.",
      description: "Architectural style of the space's structures.",
    }),
    operatingHours: JsonValueSchema.openapi({
      example: { weekdays: "09:00-21:00" },
      description: "Operating hours in flexible JSON.",
    }),
    entranceFee: JsonValueSchema.openapi({
      example: { amount: 10000, currency: "IDR" },
      description: "Entrance fee details in flexible JSON.",
    }),
    contactInfo: JsonValueSchema.openapi({
      example: { phone: "123-456-7890" },
      description: "Contact information in flexible JSON.",
    }),
    accessibility: JsonValueSchema.openapi({
      example: { wheelchair_accessible: true },
      description: "Accessibility details in flexible JSON.",
    }),
    typeId: z.string().openapi({
      example: "clxob8g8p000008jp8x1m9h5t",
      description: "ID of the associated SpaceType (e.g., 'Park', 'Museum').",
    }),
    categoryIds: z
      .array(z.string())
      .optional()
      .openapi({
        example: ["cat_id_1", "cat_id_2"],
        description:
          "List of IDs of existing SpaceCategories to associate with the new space.",
      }),
    featureIds: z
      .array(z.string())
      .optional()
      .openapi({
        example: ["feat_id_1", "feat_id_2"],
        description:
          "List of IDs of existing SpaceFeatures to associate with the new space.",
      }),
  })
  .openapi("CreateSpaceRequest");

export const UpdateSpaceRequestSchema =
  CreateSpaceRequestSchema.partial().openapi("UpdateSpaceRequest", {
    description:
      "Schema for partially updating an existing space. All fields are optional. Only fields provided in the request body will be updated.",
  });

export const ErrorResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Failed to retrieve spaces." }),
    code: z.number().int().openapi({ example: 500 }),
  })
  .openapi("ErrorResponse");
