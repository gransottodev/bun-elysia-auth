import { db } from "@/database/client";
import { services } from "@/database/schema/services";
import { userServices } from "@/database/schema/user-services";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { describe } from "bun:test";
import Elysia, { t } from "elysia";

export const createService = new Elysia().use(betterAuthPlugin).post(
  "/services",
  async ({ body, session }) => {
    const { name, description, price, duration, elegibleUsers } = body;

    const { activeOrganizationId } = session;

    if (!activeOrganizationId) {
      throw new Error("No active organization");
    }

    const result = await db.transaction(async (tx) => {
      const [service] = await tx
        .insert(services)
        .values({
          name,
          description: description ?? "",
          price,
          duration: duration ?? 0,
          organizationId: activeOrganizationId,
        })
        .returning({
          id: services.id,
        });

      if (elegibleUsers && elegibleUsers.length > 0) {
        await Promise.all(
          elegibleUsers.map((userId) =>
            tx.insert(userServices).values({
              serviceId: service.id,
              userId,
            }),
          ),
        );
      }

      return service;
    });

    return {
      success: true,
      service: result,
    };
  },
  {
    auth: true,
    detail: {
      summary: "Create a new service",
      description:
        "Creates a new service for the active organization and optionally assigns eligible users to it",
      tags: ["services"],
    },
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
              description: "List of user IDs who are eligible for this service",
              examples: [["550e8400-e29b-41d4-a716-446655440000"]],
            },
          ),
        ),
      },
      {
        description: "Service creation request payload",
      },
    ),
  },
);
