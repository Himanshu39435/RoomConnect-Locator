import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Listings Routes
  app.get(api.listings.list.path, async (req, res) => {
    try {
      const filters = api.listings.list.input?.parse(req.query);
      const listings = await storage.getListings(filters);
      res.json(listings);
    } catch (err) {
      res.status(400).json({ message: "Invalid filters" });
    }
  });

  app.get(api.listings.get.path, async (req, res) => {
    const listing = await storage.getListing(Number(req.params.id));
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  });

  app.post(api.listings.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.listings.create.input.parse(req.body);
      // We know req.user exists because of isAuthenticated
      const user = req.user as any; 
      const ownerId = user.claims.sub;

      const listing = await storage.createListing({
        ...input,
        ownerId,
      });
      res.status(201).json(listing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.listings.update.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getListing(id);
    
    if (!existing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const user = req.user as any;
    if (existing.ownerId !== user.claims.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const input = api.listings.update.input.parse(req.body);
      const updated = await storage.updateListing(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.listings.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getListing(id);
    
    if (!existing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const user = req.user as any;
    if (existing.ownerId !== user.claims.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await storage.deleteListing(id);
    res.status(204).send();
  });

  // Seed data
  try {
    const demoUser = await storage.getUser("demo-user");
    if (!demoUser) {
      console.log("Seeding database...");
      await storage.upsertUser({
        id: "demo-user",
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
      });

      await storage.createListing({
        title: "Cozy Studio in Downtown",
        description: "A beautiful studio apartment in the heart of the city. Close to public transport and amenities. Perfect for singles or couples.",
        location: "Downtown, Metro City",
        price: 1200,
        propertyType: "1 BHK",
        tenantPreference: "Bachelor",
        imageUrls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
        contactPhone: "+1234567890",
        ownerId: "demo-user",
      });

      await storage.createListing({
        title: "Spacious 2 BHK for Family",
        description: "Large 2 bedroom apartment with balcony and park view. Safe neighborhood, near schools and hospitals.",
        location: "Greenwood Heights",
        price: 2500,
        propertyType: "2 BHK",
        tenantPreference: "Family",
        imageUrls: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"],
        contactPhone: "+1987654321",
        ownerId: "demo-user",
      });

      // Additional 10 rooms
      const locations = [
        "Delhi", "Dehradun", "Uttarakhand", "Haridwar", "Rishikesh", 
        "Clement Town", "Noida", "Delhi North", "Dehradun Heights", "Noida Sector 62"
      ];

      for (let i = 0; i < locations.length; i++) {
        await storage.createListing({
          title: `Modern Room in ${locations[i]}`,
          description: `A comfortable and well-maintained living space located in ${locations[i]}. Close to essential services and transport.`,
          location: locations[i],
          price: 1000 + (i * 200),
          propertyType: i % 2 === 0 ? "1 BHK" : "2 BHK",
          tenantPreference: i % 3 === 0 ? "Bachelor" : (i % 3 === 1 ? "Family" : "Working"),
          imageUrls: [`https://images.unsplash.com/photo-${1500000000000 + i}?w=800&q=80`],
          contactPhone: `+91${9000000000 + i}`,
          ownerId: "demo-user",
        });
      }
      console.log("Database seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }

  return httpServer;
}
