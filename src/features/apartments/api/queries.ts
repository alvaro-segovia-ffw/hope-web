import { useQuery } from "@tanstack/react-query";

import { getAllApartments, getApartmentByExternalId, getApartments } from "./apartments-api";

export function useApartmentsQuery(page: number, perPage: number) {
  return useQuery({
    queryKey: ["apartments", page, perPage],
    queryFn: () => getApartments(page, perPage),
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

export function useApartmentsGlobalSearchQuery(searchExternalId: string) {
  const normalizedSearchTerm = searchExternalId.trim().toLowerCase();

  return useQuery({
    queryKey: ["apartments", "global-search", normalizedSearchTerm],
    queryFn: async () => {
      const apartments = await getAllApartments();
      return apartments.filter((apartment) =>
        apartment.externalId.toLowerCase().includes(normalizedSearchTerm),
      );
    },
    enabled: normalizedSearchTerm.length > 0,
    staleTime: 30_000,
  });
}
