import { Elysia } from "elysia";
import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth";
import openapi from "@elysiajs/openapi";
import { createService } from "./routes/services/create-service";
import { servicesRoutes } from "./routes/services";

const app = new Elysia()
  .use(betterAuthPlugin)
  .use(servicesRoutes)
  .get("/", () => "Hello World")
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
