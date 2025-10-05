import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { randomUUIDv7 } from "bun";

export const sessions = pgTable("sessions", {
  id: text("id").$defaultFn(() => randomUUIDv7()).primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
});
