import { randomUUIDv7 } from "bun";
import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./users";
import { services } from "./services";
import { relations } from "drizzle-orm";

export const userServices = pgTable(
  "user_services",
  {
    id: text("id")
      .$defaultFn(() => randomUUIDv7())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.serviceId] }),
  })
);

// Relations
export const userServicesRelations = relations(userServices, ({ one }) => ({
  user: one(users, {
    fields: [userServices.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [userServices.serviceId],
    references: [services.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  userServices: many(userServices),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  userServices: many(userServices),
}));
