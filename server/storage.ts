import { users, listings, type User, type InsertUser, type Listing, type InsertListing } from "@shared/schema";
import { db } from "./db";
import { eq, like, and, gte, lte } from "drizzle-orm";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface ListingFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  tenantPreference?: string;
}

export interface IStorage extends IAuthStorage {
  getListings(filters?: ListingFilters): Promise<Listing[]>;
  getListing(id: number): Promise<Listing | undefined>;
  createListing(listing: InsertListing & { ownerId: string }): Promise<Listing>;
  updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Delegate auth methods to the auth storage implementation
  getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }
  
  upsertUser(user: any): Promise<User> {
    return authStorage.upsertUser(user);
  }

  async getListings(filters?: ListingFilters): Promise<Listing[]> {
    const conditions = [];
    
    if (filters?.location) {
      conditions.push(like(listings.location, `%${filters.location}%`));
    }
    if (filters?.minPrice) {
      conditions.push(gte(listings.price, filters.minPrice));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(listings.price, filters.maxPrice));
    }
    if (filters?.propertyType) {
      conditions.push(eq(listings.propertyType, filters.propertyType as any));
    }
    if (filters?.tenantPreference) {
      conditions.push(eq(listings.tenantPreference, filters.tenantPreference as any));
    }

    return await db.select().from(listings).where(and(...conditions));
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async createListing(insertListing: InsertListing & { ownerId: string }): Promise<Listing> {
    const [listing] = await db
      .insert(listings)
      .values(insertListing)
      .returning();
    return listing;
  }

  async updateListing(id: number, updates: Partial<InsertListing>): Promise<Listing> {
    const [updated] = await db
      .update(listings)
      .set(updates)
      .where(eq(listings.id, id))
      .returning();
    return updated;
  }

  async deleteListing(id: number): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
  }
}

export const storage = new DatabaseStorage();
