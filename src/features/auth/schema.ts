import { z } from "zod";

// Schema for a successful authentication response (e.g., after login/registration)
export const AuthSuccessResponseSchema = z.object({
  token: z
    .string()
    .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }),
  message: z.string().openapi({ example: "Authentication successful." }),
  userId: z.string().openapi({ example: "auth-user-123" }),
});

// Schema for login request body
export const LoginRequestSchema = z.object({
  email: z.string().email().openapi({
    example: "user@example.com",
    description: "User's email address.",
  }),
  password: z.string().min(6).openapi({
    example: "SecurePassword123",
    description: "User's password (min 6 characters).",
  }),
});

// Schema for registration request body
export const RegisterRequestSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(50, "Username cannot exceed 50 characters.")
    .openapi({
      example: "jane_doe",
      description: "User's unique username for public display and login.",
    }),
  email: z.string().email("Invalid email address format.").openapi({
    example: "newuser@example.com",
    description: "User's unique email address, used for login.",
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .openapi({
      example: "StrongP@ssw0rd!",
      description: "User's password (min 8 characters).",
    }),
});

// Schema for a generic error response (useful for invalid credentials, etc.)
export const ErrorResponseSchema = z.object({
  message: z.string().openapi({ example: "Invalid credentials." }),
  code: z.number().int().openapi({ example: 401 }),
});
