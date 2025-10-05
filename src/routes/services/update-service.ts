import { db } from "@/database/client";
import { services } from "@/database/schema/services";
import { userServices } from "@/database/schema/user-services";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

export const updateService = new Elysia()
  .use(betterAuthPlugin)
  .put(
    "/services/:id",
    async ({ params: { id }, body, session }) => {
      const { name, description, price, duration, elegibleUsers } = body;

      const activeOrganizationId = session.activeOrganizationId;

      if (!activeOrganizationId) {
        throw new Error("No active organization");
      }

      // Verificar se o serviço existe e pertence à organização
      const [existingService] = await db
        .select({
          id: services.id,
          organizationId: services.organizationId,
        })
        .from(services)
        .where(
          and(
            eq(services.id, id),
            eq(services.organizationId, activeOrganizationId),
          ),
        );

      if (!existingService) {
        throw new Error("Service not found");
      }

      const result = await db.transaction(async (tx) => {
        const [updatedService] = await tx
          .update(services)
          .set({
            name,
            description: description ?? "",
            price,
            duration: duration ?? 0,
          })
          .where(eq(services.id, id))
          .returning({
            id: services.id,
            name: services.name,
            description: services.description,
            price: services.price,
            duration: services.duration,
            organizationId: services.organizationId,
          });

        if (elegibleUsers !== undefined) {
          await tx.delete(userServices).where(eq(userServices.serviceId, id));

          if (elegibleUsers.length > 0) {
            await Promise.all(
              elegibleUsers.map((userId) =>
                tx.insert(userServices).values({
                  serviceId: id,
                  userId,
                }),
              ),
            );
          }
        }

        return updatedService;
      });

      return {
        success: true,
        service: result,
      };
    },
    {
      auth: true,
      detail: {
        summary: "Update a service",
        description:
          "Updates a service's information and optionally updates the list of eligible users",
        tags: ["services"],
      },
      params: t.Object({
        id: t.String({
          description: "The ID of the service to update",
          format: "uuid",
        }),
      }),
      body: t.Object(
        {
          name: t.String({
            minLength: 2,
            maxLength: 100,
            description: "The name of the service",
            examples: ["Medical Consultation", "Dental Cleaning"],
          }),
          description: t.Optional(
            t.String({
              minLength: 2,
              maxLength: 1000,
              description: "A detailed description of the service",
              examples: [
                "General medical consultation with a licensed physician",
              ],
            }),
          ),
          price: t.Number({
            minimum: 1,
            description:
              "The price of the service in cents (e.g., 15000 for $150.00)",
            examples: [15000, 25000],
          }),
          duration: t.Optional(
            t.Number({
              minimum: 1,
              description: "The duration of the service in minutes",
              examples: [30, 60, 90],
            }),
          ),
          elegibleUsers: t.Optional(
            t.Array(
              t.String({
                description: "User ID",
                format: "uuid",
              }),
              {
                description:
                  "List of user IDs who are eligible for this service. If provided, replaces the current list entirely",
                examples: [["550e8400-e29b-41d4-a716-446655440000"]],
              },
            ),
          ),
        },
        {
          description: "Service update request payload",
        },
      ),
    },
  )
  .patch(
    "/services/:id",
    async ({ params: { id }, body, session }) => {
      const { name, description, price, duration, elegibleUsers } = body;

      const activeOrganizationId = session.activeOrganizationId;

      if (!activeOrganizationId) {
        throw new Error("No active organization");
      }

      // Verificar se o serviço existe e pertence à organização
      const [existingService] = await db
        .select({
          id: services.id,
          organizationId: services.organizationId,
        })
        .from(services)
        .where(
          and(
            eq(services.id, id),
            eq(services.organizationId, activeOrganizationId),
          ),
        );

      if (!existingService) {
        throw new Error("Service not found");
      }

      const result = await db.transaction(async (tx) => {
        // 1. Atualizar apenas os campos fornecidos
        const updateData: Partial<typeof services.$inferInsert> = {};

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (duration !== undefined) updateData.duration = duration;

        let updatedService;

        if (Object.keys(updateData).length > 0) {
          [updatedService] = await tx
            .update(services)
            .set(updateData)
            .where(eq(services.id, id))
            .returning({
              id: services.id,
              name: services.name,
              description: services.description,
              price: services.price,
              duration: services.duration,
              organizationId: services.organizationId,
            });
        } else {
          // Se não há dados para atualizar, buscar o serviço atual
          [updatedService] = await tx
            .select({
              id: services.id,
              name: services.name,
              description: services.description,
              price: services.price,
              duration: services.duration,
              organizationId: services.organizationId,
            })
            .from(services)
            .where(eq(services.id, id));
        }

        // 2. Se elegibleUsers foi fornecido, atualizar as relações
        if (elegibleUsers !== undefined) {
          // Remover todas as relações existentes
          await tx.delete(userServices).where(eq(userServices.serviceId, id));

          // Adicionar novas relações
          if (elegibleUsers.length > 0) {
            await Promise.all(
              elegibleUsers.map((userId) =>
                tx.insert(userServices).values({
                  serviceId: id,
                  userId,
                }),
              ),
            );
          }
        }

        return updatedService;
      });

      return {
        success: true,
        service: result,
      };
    },
    {
      auth: true,
      detail: {
        summary: "Partially update a service",
        description:
          "Partially updates a service's information. Only provided fields will be updated",
        tags: ["services"],
      },
      params: t.Object({
        id: t.String({
          description: "The ID of the service to update",
          format: "uuid",
        }),
      }),
      body: t.Object(
        {
          name: t.Optional(
            t.String({
              minLength: 2,
              maxLength: 100,
              description: "The name of the service",
              examples: ["Medical Consultation", "Dental Cleaning"],
            }),
          ),
          description: t.Optional(
            t.String({
              minLength: 2,
              maxLength: 1000,
              description: "A detailed description of the service",
              examples: [
                "General medical consultation with a licensed physician",
              ],
            }),
          ),
          price: t.Optional(
            t.Number({
              minimum: 1,
              description:
                "The price of the service in cents (e.g., 15000 for $150.00)",
              examples: [15000, 25000],
            }),
          ),
          duration: t.Optional(
            t.Number({
              minimum: 1,
              description: "The duration of the service in minutes",
              examples: [30, 60, 90],
            }),
          ),
          elegibleUsers: t.Optional(
            t.Array(
              t.String({
                description: "User ID",
                format: "uuid",
              }),
              {
                description:
                  "List of user IDs who are eligible for this service. If provided, replaces the current list entirely",
                examples: [["550e8400-e29b-41d4-a716-446655440000"]],
              },
            ),
          ),
        },
        {
          description: "Service partial update request payload",
        },
      ),
    },
  );
