import { z } from "zod";

export const apartmentSchema = z
  .object({
    externalId: z.string(),
    title: z.string().optional(),
    name: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    address: z.string().optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    area: z.number().optional(),
    images: z.array(z.string()).optional(),
  })
  .passthrough();

const apartmentsCollectionSchema = z
  .object({
    items: z.array(apartmentSchema).optional(),
    data: z.array(apartmentSchema).optional(),
    results: z.array(apartmentSchema).optional(),
    page: z.number().optional(),
    perPage: z.number().optional(),
    total: z.number().optional(),
  })
  .passthrough();

export const apartmentsResponseSchema = z.union([
  z.array(apartmentSchema),
  apartmentsCollectionSchema,
]);

const apartmentDetailEnvelopeSchema = z
  .object({
    item: apartmentSchema.optional(),
    data: apartmentSchema.optional(),
    apartment: apartmentSchema.optional(),
  })
  .passthrough();

export const apartmentDetailResponseSchema = z.union([
  apartmentSchema,
  apartmentDetailEnvelopeSchema,
]);

export type Apartment = z.infer<typeof apartmentSchema>;

export type ApartmentsPageResult = {
  items: Apartment[];
  page: number;
  perPage: number;
  total?: number;
};
