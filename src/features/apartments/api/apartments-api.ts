import { apiRequest } from "@/lib/api/http-client";

import {
  apartmentSchema,
  apartmentDetailResponseSchema,
  apartmentsResponseSchema,
  type Apartment,
  type ApartmentsPageResult,
} from "./schemas";

export async function getApartments(page: number, perPage: number): Promise<ApartmentsPageResult> {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });

  const response = await apiRequest<unknown>(`/api/v1/apartments?${params.toString()}`);
  const parsed = apartmentsResponseSchema.parse(response);

  if (Array.isArray(parsed)) {
    return {
      items: parsed,
      page,
      perPage,
    };
  }

  return {
    items: parsed.items ?? parsed.data ?? parsed.results ?? [],
    page: parsed.page ?? page,
    perPage: parsed.perPage ?? perPage,
    total: parsed.total,
  };
}

export async function getAllApartments(): Promise<Apartment[]> {
  const perPage = 100;
  const maxPages = 100;
  let page = 1;
  const collected: Apartment[] = [];

  while (page <= maxPages) {
    const response = await getApartments(page, perPage);
    collected.push(...response.items);

    const reachedEndBySize = response.items.length < perPage;
    const reachedEndByTotal =
      typeof response.total === "number" && collected.length >= response.total;

    if (reachedEndBySize || reachedEndByTotal) {
      break;
    }

    page += 1;
  }

  const uniqueByExternalId = new Map<string, Apartment>();
  for (const apartment of collected) {
    uniqueByExternalId.set(apartment.externalId, apartment);
  }

  return [...uniqueByExternalId.values()];
}

export async function getApartmentByExternalId(externalId: string): Promise<Apartment> {
  const response = await apiRequest<unknown>(`/api/v1/apartments/${externalId}`);
  const parsed = apartmentDetailResponseSchema.parse(response);
  const directApartment = apartmentSchema.safeParse(parsed);

  if (directApartment.success) {
    return directApartment.data;
  }

  const apartment = parsed.item ?? parsed.data ?? parsed.apartment;

  if (!apartment) {
    throw new Error("Apartment not found.");
  }

  return apartmentSchema.parse(apartment);
}
