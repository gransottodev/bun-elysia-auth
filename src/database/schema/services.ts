import { randomUUIDv7 } from "bun";
import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const services = pgTable("services", {
  id: text("id").$defaultFn(() => randomUUIDv7()).primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, {onDelete: "cascade"}),
})