import { db } from "@/database/client";
import { services } from "@/database/schema/services";
import { userServices } from "@/database/schema/user-services";
import { users } from "@/database/schema/users";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

export const listServices = new Elysia()
  .use(betterAuthPlugin)
  .get(
    "/services",
    async ({ session }) => {
      const activeOrganizationId = session.activeOrganizationId;

      if (!activeOrganizationId) {
        throw new Error("No active organization");
      }

      const organizationServices = await db
        .select({
          id: services.id,
          name: services.name,
          description: services.description,
          price: services.price,
          duration: services.duration,
          organizationId: services.organizationId,
        })
        .from(services)
        .where(eq(services.organizationId, activeOrganizationId));

      const servicesWithUsers = await Promise.all(
        organizationServices.map(async (service) => {
          const eligibleUsers = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
              image: users.image,
            })
            .from(userServices)
            .innerJoin(users, eq(userServices.userId, users.id))
            .where(eq(userServices.serviceId, service.id));

          return {
            ...service,
            eligibleUsers,
          };
        }),
      );

      return {
        success: true,
        services: servicesWithUsers,
      };
    },
    {
      auth: true,
      detail: {
        description: "List all services for active organization",
        summary: "List all services",
        detail: "This endpoint returns a list of all services",
        tags: ["services"],
      },
    },
  )
  .get(
    "/services/:id",
    async ({ params: { id }, session }) => {
      const activeOrganizationId = session.activeOrganizationId;

      if (!activeOrganizationId) {
        throw new Error("No active organization");
      }

      const [service] = await db
        .select({
          id: services.id,
          name: services.name,
          description: services.description,
          price: services.price,
          duration: services.duration,
          organizationId: services.organizationId,
        })
        .from(services)
        .where(
          and(
            eq(services.id, id),
            eq(services.organizationId, activeOrganizationId),
          ),
        );

      if (!service) {
        throw new Error("Service not found");
      }

      const eligibleUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        })
        .from(userServices)
        .innerJoin(users, eq(userServices.userId, users.id))
        .where(eq(userServices.serviceId, service.id));

      return {
        success: true,
        service: {
          ...service,
          eligibleUsers,
        },
      };
    },
    {
      auth: true,
      detail: {
        summary: "List service by ID",
        description: "List service by ID",
        tags: ["services"],
      },
      params: t.Object({
        id: t.String({
          description: "The ID of the service",
        }),
      }),
    },
  );
