"use client";

import { ApiError } from "@/lib/api/http-client";
import { useI18n } from "@/features/i18n/i18n-context";

type ErrorPanelProps = {
  error: Error;
};

export function ErrorPanel({ error }: ErrorPanelProps) {
  const status = error instanceof ApiError ? error.status : undefined;
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-900 shadow-sm">
      <p className="font-semibold">{t("errors.loadingData", { status: status ? ` (${status})` : "" })}</p>
      <p className="mt-1 text-red-800">{error.message}</p>
    </div>
  );
}
