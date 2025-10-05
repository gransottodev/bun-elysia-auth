import { db } from "@/database/client";
import { services } from "@/database/schema/services";
import { userServices } from "@/database/schema/user-services";
import { users } from "@/database/schema/users";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

export const manageServiceUsers = new Elysia()
  .use(betterAuthPlugin)
  .post(
    "/services/:serviceId/users",
    async ({ params: { serviceId }, body, session }) => {
      const { userId } = body;

      const activeOrganizationId = session.activeOrganizationId;

      if (!activeOrganizationId) {
        throw new Error("No active organization");
      }

      const [service] = await db
        .select({
          id: services.id,
          organizationId: services.organizationId,
        })
        .from(services)
        .where(eq(services.id, serviceId));

      if (!service) {
        throw new Error("Service not found");
      }

      if (service.organizationId !== activeOrganizationId) {
        throw new Error("Service not found");
      }

      // Verificar se o usuário existe
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        throw new Error("User not found");
      }

      const [existingRelation] = await db
        .select()
        .from(userServices)
        .where(
          and(
            eq(userServices.serviceId, serviceId),
            eq(userServices.userId, userId),
          ),
        );

      if (existingRelation) {
        return {
          success: false,
          message: "User is already eligible for this service",
        };
      }

      await db.insert(userServices).values({
        serviceId,
        userId,
      });

      return {
        success: true,
        message: "User added to service successfully",
      };
    },
    {
      auth: true,
      body: t.Object({
        userId: t.String({
          description: "User ID to be added to the service",
        }),
      }),
      detail: {
        description: "Add a user to a service",
        tags: ["services"],
      },
    },
  )
  .delete(
    "/services/:serviceId/users/:userId",
    async ({ params: { serviceId, userId }, session }) => {
      const activeOrganizationId = session.activeOrganizationId;

      if (!activeOrganizationId) {
        throw new Error("No active organization");
      }

      const [service] = await db
        .select({
          id: services.id,
          organizationId: services.organizationId,
        })
        .from(services)
        .where(eq(services.id, serviceId));

      if (!service) {
        throw new Error("Service not found");
      }

      if (service.organizationId !== activeOrganizationId) {
        throw new Error("Service not found");
      }

      const [existingRelation] = await db
        .select()
        .from(userServices)
        .where(
          and(
            eq(userServices.serviceId, serviceId),
            eq(userServices.userId, userId),
          ),
        );

      if (!existingRelation) {
        return {
          success: false,
          message: "User is not eligible for this service",
        };
      }

      await db
        .delete(userServices)
        .where(
          and(
            eq(userServices.serviceId, serviceId),
            eq(userServices.userId, userId),
          ),
        );

      return {
        success: true,
        message: "User removed from service successfully",
      };
    },
    {
      auth: true,
      detail: {
        description: "Remove a user from a service",
        tags: ["services", "users"],
        summary: "Remove a user from a service",
        params: {
          serviceId: "ID of the service",
          userId: "ID of the user",
        },
      },
    },
  )
  .get(
    "/users/:userId/services",
    async ({ params: { userId }, session }) => {
      const activeOrganizationId = session.activeOrganizationId;

      if (!activeOrganizationId) {
        throw new Error("No active organization");
      }

      // Verificar se o usuário existe
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        throw new Error("User not found");
      }

      // Buscar todos os serviços aos quais o usuário tem acesso
      const userServicesList = await db
        .select({
          id: services.id,
          name: services.name,
          description: services.description,
          price: services.price,
          duration: services.duration,
          organizationId: services.organizationId,
        })
        .from(userServices)
        .innerJoin(services, eq(userServices.serviceId, services.id))
        .where(
          and(
            eq(userServices.userId, userId),
            eq(services.organizationId, activeOrganizationId),
          ),
        );

      return {
        success: true,
        user,
        services: userServicesList,
      };
    },
    {
      auth: true,
      detail: {
        summary: "Get a list of services a user has access to",
        description: "Get a list of services a user has access to",
        tags: ["services", "users"],
      },
    },
  );
