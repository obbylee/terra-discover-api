import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().openapi({ example: "clxob8g8p000008jp8x1m9h5v" }),
  username: z.string().openapi({ example: "johndoe" }),
  email: z.string().email().openapi({ example: "john.doe@example.com" }),
  profilePicture: z
    .string()
    .url()
    .nullable()
    .optional()
    .openapi({ example: "https://i.pravatar.cc/150?img=68" }),
  bio: z
    .string()
    .nullable()
    .optional()
    .openapi({ example: "An avid explorer." }),
});

export const UsersListResponseSchema = z.array(UserSchema).openapi({
  example: [
    {
      id: "clxob8g8p000008jp8x1m9h5v",
      username: "alice_explorer",
      email: "alice@example.com",
      profilePicture: "https://i.pravatar.cc/150?img=1",
      bio: "Loves nature and photography.",
    },
    {
      id: "clxob8g8p000108jp8x1m9h5w",
      username: "bob_traveler",
      email: "bob@example.com",
      profilePicture: null,
      bio: "Always looking for historical sites.",
    },
  ],
});

export const ErrorResponseSchema = z.object({
  message: z.string().openapi({ example: "Failed to retrieve users." }),
  code: z.number().int().openapi({ example: 500 }),
});
