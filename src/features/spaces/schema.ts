import { z } from "zod";

const JsonValueSchema = z
  .record(z.any())
  .nullable()
  .optional()
  .openapi({
    type: "object",
    description: "Arbitrary JSON object, can be null.",
    example: { key: "value", anotherKey: 123 },
  });

export const SpaceSchema = z.object({
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
    description: "Unique URL-friendly slug for the space.",
  }),
  alternateNames: z
    .array(z.string())
    .optional()
    .openapi({
      example: ["Bungkul Park", "Bungkul City Park"],
      description: "Other names by which the space is known.",
    }),
  description: z.string().nullable().optional().openapi({
    example:
      "A vibrant urban park in Surabaya, known for its various community activities.",
    description: "Detailed description of the space.",
  }),
  activities: z
    .array(z.string())
    .optional()
    .openapi({
      example: ["picnic", "jogging", "cultural events"],
      description: "List of activities available at the space.",
    }),
  historicalContext: z.string().nullable().optional().openapi({
    example: "Originally established as a cemetery in the Dutch colonial era.",
    description: "Historical significance or background of the space.",
  }),
  architecturalStyle: z.string().nullable().optional().openapi({
    example: "Modern minimalist with traditional Javanese elements",
    description: "Architectural style of the space's notable structures.",
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
    description: "Timestamp when the space record was created.",
  }),
  updatedAt: z.string().datetime().openapi({
    example: "2024-07-08T14:30:00Z",
    description: "Timestamp when the space record was last updated.",
  }),
  typeId: z.string().openapi({
    example: "clxob8g8p000008jp8x1m9h5t",
    description: "ID of the associated SpaceType.",
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
});

// Update example for SpacesListResponseSchema
export const SpacesListResponseSchema = z.array(SpaceSchema).openapi({
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

// Schema for creating a new space (ID, slug, createdAt, updatedAt are generated by server)
const CreateSpaceRequestSchema = SpaceSchema.omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  // Omit the fields that are *output* of transformation, not input
  categories: true,
  features: true,
}).required({
  name: true,
  typeId: true,
  submittedById: true,
});

// Schema for updating an existing space (all fields optional for partial update)
const UpdateSpaceRequestSchema = SpaceSchema.partial().omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
  // Omit the fields that are *output* of transformation, not input
  categories: true,
  features: true,
});

// Schema for a generic error response (can be reused from auth/users if defined globally)
export const ErrorResponseSchema = z.object({
  message: z.string().openapi({ example: "Failed to retrieve spaces." }),
  code: z.number().int().openapi({ example: 500 }),
});
