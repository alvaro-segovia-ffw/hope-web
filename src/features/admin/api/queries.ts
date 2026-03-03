import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApartmentsCount, getLastSyncRun, runSync } from "./admin-api";

export function useApartmentsCountQuery(token?: string) {
  return useQuery({
    queryKey: ["admin", "apartments-count"],
    queryFn: () => getApartmentsCount(token ?? ""),
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}

export function useLastRunQuery(token?: string) {
  return useQuery({
    queryKey: ["admin", "last-run"],
    queryFn: () => getLastSyncRun(token ?? ""),
    enabled: Boolean(token),
    staleTime: 15_000,
  });
}

export function useRunSyncMutation(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => runSync(token ?? ""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "last-run"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "apartments-count"] });
    },
  });
}
