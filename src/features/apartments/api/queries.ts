import { useQuery } from "@tanstack/react-query";

import {
  getAllApartmentsBySource,
  getApartmentByExternalId,
  getApartments,
  type ApartmentsSource,
} from "./apartments-api";

export function useApartmentsQuery(
  page: number,
  perPage: number,
  source: ApartmentsSource = "all",
) {
  return useQuery({
    queryKey: ["apartments", source, page, perPage],
    queryFn: () => getApartments(page, perPage, source),
    staleTime: 30_000,
  });
}

export function useApartmentDetailQuery(externalId?: string) {
  const normalizedExternalId = externalId ?? "";

  return useQuery({
    queryKey: ["apartment", normalizedExternalId],
    queryFn: () => getApartmentByExternalId(normalizedExternalId),
    enabled: normalizedExternalId.length > 0,
  });
}

export function useApartmentsGlobalSearchQuery(
  searchExternalId: string,
  source: ApartmentsSource = "all",
) {
  const normalizedSearchTerm = searchExternalId.trim().toLowerCase();

  return useQuery({
    queryKey: ["apartments", source, "global-search", normalizedSearchTerm],
    queryFn: async () => {
      const apartments = await getAllApartmentsBySource(source);
      return apartments.filter((apartment) =>
        apartment.externalId.toLowerCase().includes(normalizedSearchTerm),
      );
    },
    enabled: normalizedSearchTerm.length > 0,
    staleTime: 30_000,
  });
}

export function useApartmentsTotalCountQuery(
  source: ApartmentsSource = "all",
  enabled = true,
) {
  return useQuery({
    queryKey: ["apartments", source, "total-count"],
    queryFn: async () => {
      const apartments = await getAllApartmentsBySource(source);
      return apartments.length;
    },
    enabled,
    staleTime: 30_000,
  });
}
