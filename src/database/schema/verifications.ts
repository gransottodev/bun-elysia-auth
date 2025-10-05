import { randomUUIDv7 } from "bun";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const verifications = pgTable("verifications", {
  id: text("id").$defaultFn(() => randomUUIDv7()).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});
