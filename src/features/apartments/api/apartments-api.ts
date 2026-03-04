import { apiRequest } from "@/lib/api/http-client";

import {
  apartmentSchema,
  apartmentDetailResponseSchema,
  apartmentsResponseSchema,
  type Apartment,
  type ApartmentsPageResult,
} from "./schemas";

export type ApartmentsSource = "all" | "availableForRent";

function getApartmentsPath(source: ApartmentsSource): string {
  if (source === "availableForRent") {
    return "/api/v1/apartments/available-for-rent";
  }

  return "/api/v1/apartments";
}

export async function getApartments(
  page: number,
  perPage: number,
  source: ApartmentsSource = "all",
): Promise<ApartmentsPageResult> {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
  });

  const response = await apiRequest<unknown>(`${getApartmentsPath(source)}?${params.toString()}`);
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

async function getAllApartmentsInternal(source: ApartmentsSource): Promise<Apartment[]> {
  const perPage = 100;
  const maxPages = 100;
  let page = 1;
  const collected: Apartment[] = [];

  while (page <= maxPages) {
    const response = await getApartments(page, perPage, source);
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

export async function getAllApartments(): Promise<Apartment[]> {
  return getAllApartmentsInternal("all");
}

export async function getAllApartmentsBySource(source: ApartmentsSource): Promise<Apartment[]> {
  return getAllApartmentsInternal(source);
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
