import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Scalar } from "@scalar/hono-api-reference";
import { userRoutes } from "./features/users/route";
import { authRoutes } from "./features/auth/route";
import { spaceRoutes } from "./features/spaces/route";

const app = new OpenAPIHono().basePath("/api");

app.use(logger());

app.use(
  cors({
    origin: "*",
  })
);

app.get(
  "/docs",
  Scalar({
    pageTitle: "Terra Discover API Documentation",
    theme: "default",
    url: "/api/openapi.json",
  })
);

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    version: "0.0.1",
    title: "Terra Discover API",
    description: "API for Terra Discover API",
  },
  servers: [
    {
      url: Bun.env.API_BASE_URL || "http://localhost:3000",
      description: "API Server",
    },
  ],
});

app.openAPIRegistry.registerComponent(
  "securitySchemes",
  "AuthorizationBearer",
  {
    type: "http",
    scheme: "bearer",
    in: "header",
    description: "Bearer token for API authentication.",
    bearerFormat: "JWT",
  }
);

app.get("/", (c) => {
  return c.text(
    "Welcome to the Terra Discover API! Visit /api/docs for documentation."
  );
});

app.route("/users", userRoutes);
app.route("/auth", authRoutes);
app.route("/spaces", spaceRoutes);

export default app;
