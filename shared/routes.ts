import { z } from 'zod';
import { insertListingSchema, listings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  listings: {
    list: {
      method: 'GET' as const,
      path: '/api/listings',
      input: z.object({
        location: z.string().optional(),
        minPrice: z.coerce.number().optional(),
        maxPrice: z.coerce.number().optional(),
        propertyType: z.enum(["1 BHK", "2 BHK", "1 Bed", "2 Bed", "3 Bed"]).optional(),
        tenantPreference: z.enum(["Bachelor", "Family", "Girls", "Working"]).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof listings.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/listings/:id',
      responses: {
        200: z.custom<typeof listings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/listings',
      input: insertListingSchema,
      responses: {
        201: z.custom<typeof listings.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/listings/:id',
      input: insertListingSchema.partial(),
      responses: {
        200: z.custom<typeof listings.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/listings/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ListingInput = z.infer<typeof api.listings.create.input>;
export type ListingResponse = z.infer<typeof api.listings.create.responses[201]>;
