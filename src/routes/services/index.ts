import Elysia from "elysia";
import { createService } from "./create-service";
import { listServices } from "./list-services";
import { manageServiceUsers } from "./manage-service-users";
import { updateService } from "./update-service";
import openapi from "@elysiajs/openapi";

export const servicesRoutes = new Elysia({ name: "Services" })
  .use(openapi())
  .use(createService)
  .use(listServices)
  .use(updateService)
  .use(manageServiceUsers);
