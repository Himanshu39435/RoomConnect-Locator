import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ListingInput } from "@shared/routes";
import { z } from "zod";

// ============================================
// LISTINGS HOOKS
// ============================================

// GET /api/listings
export function useListings(filters?: {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: "1 BHK" | "2 BHK" | "1 Bed" | "2 Bed" | "3 Bed";
  tenantPreference?: "Bachelor" | "Family" | "Girls" | "Working";
}) {
  return useQuery({
    queryKey: [api.listings.list.path, filters],
    queryFn: async () => {
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params.append(key, String(value));
          }
        });
      }
      
      const url = `${api.listings.list.path}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch listings');
      
      // Parse with schema
      return api.listings.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/listings/:id
export function useListing(id: number) {
  return useQuery({
    queryKey: [api.listings.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.listings.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch listing');
      
      return api.listings.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

// POST /api/listings
export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ListingInput) => {
      const validated = api.listings.create.input.parse(data);
      const res = await fetch(api.listings.create.path, {
        method: api.listings.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.listings.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 401) throw new Error('Unauthorized');
        throw new Error('Failed to create listing');
      }
      
      return api.listings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
    },
  });
}

// PUT /api/listings/:id
export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<ListingInput>) => {
      const validated = api.listings.update.input.parse(updates);
      const url = buildUrl(api.listings.update.path, { id });
      
      const res = await fetch(url, {
        method: api.listings.update.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.listings.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error('Listing not found');
        throw new Error('Failed to update listing');
      }
      
      return api.listings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
    },
  });
}

// DELETE /api/listings/:id
export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.listings.delete.path, { id });
      const res = await fetch(url, { 
        method: api.listings.delete.method, 
        credentials: "include" 
      });

      if (res.status === 404) throw new Error('Listing not found');
      if (!res.ok) throw new Error('Failed to delete listing');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
    },
  });
}
