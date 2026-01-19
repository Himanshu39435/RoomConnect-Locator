import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
export * from "./models/auth";

export const roleEnum = pgEnum("role", ["finder", "owner"]);
export const propertyTypeEnum = pgEnum("property_type", ["1 BHK", "2 BHK", "1 Bed", "2 Bed", "3 Bed"]);
export const tenantPreferenceEnum = pgEnum("tenant_preference", ["Bachelor", "Family", "Girls", "Working"]);

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  price: integer("price").notNull(),
  propertyType: propertyTypeEnum("property_type").notNull(),
  tenantPreference: tenantPreferenceEnum("tenant_preference").notNull(),
  imageUrls: text("image_urls").array().notNull(),
  contactPhone: text("contact_phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertListingSchema = createInsertSchema(listings).omit({ 
  id: true, 
  ownerId: true, 
  createdAt: true 
}).extend({
  price: z.coerce.number().positive(),
});

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
