"use client";

import { useMemo } from "react";

import { ErrorPanel } from "@/components/error-panel";
import {
  useApartmentsCountQuery,
  useLastRunQuery,
  useRunSyncMutation,
} from "@/features/admin/api/queries";
import { useAuth } from "@/features/auth/auth-context";
import { useI18n } from "@/features/i18n/i18n-context";

export function AdminDashboard() {
  const { token } = useAuth();
  const { t } = useI18n();

  const countQuery = useApartmentsCountQuery(token);
  const lastRunQuery = useLastRunQuery(token);
  const runSyncMutation = useRunSyncMutation(token);

  const lastRunText = useMemo(() => {
    if (!lastRunQuery.data) {
      return t("admin.never");
    }

    if (typeof lastRunQuery.data !== "object") {
      return t("admin.unknown");
    }

    const rawTimestamp =
      "lastRunAt" in lastRunQuery.data
        ? lastRunQuery.data.lastRunAt
        : "lastRun" in lastRunQuery.data
          ? lastRunQuery.data.lastRun
          : undefined;
    const timestamp = extractTimestamp(rawTimestamp);

    if (!timestamp) {
      return t("admin.noDate");
    }

    const parsedDate = new Date(timestamp);
    if (Number.isNaN(parsedDate.getTime())) {
      return timestamp;
    }

    return parsedDate.toLocaleString();
  }, [lastRunQuery.data, t]);

  return (
    <section className="space-y-6">
      <div className="surface-strong">
        <p className="eyebrow">Operational Dashboard</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900">{t("admin.title")}</h1>
        <p className="muted mt-2 text-sm">{t("admin.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="surface bg-gradient-to-br from-white to-slate-50">
          <h2 className="eyebrow">{t("admin.count")}</h2>
          {countQuery.isLoading ? <p className="muted mt-3 text-sm">{t("admin.loading")}</p> : null}
          {countQuery.isError ? <div className="mt-3"><ErrorPanel error={countQuery.error} /></div> : null}
          {countQuery.isSuccess ? (
            <p className="mt-3 text-5xl font-semibold text-[#8f6f2b]">{countQuery.data}</p>
          ) : null}
        </article>

        <article className="surface bg-gradient-to-br from-white to-slate-50">
          <h2 className="eyebrow">{t("admin.lastRun")}</h2>
          {lastRunQuery.isLoading ? <p className="muted mt-3 text-sm">{t("admin.loading")}</p> : null}
          {lastRunQuery.isError ? <div className="mt-3"><ErrorPanel error={lastRunQuery.error} /></div> : null}
          {lastRunQuery.isSuccess ? (
            <p className="mt-3 text-xl font-semibold text-slate-900">{lastRunText}</p>
          ) : null}
        </article>
      </div>

      <div className="surface">
        <h2 className="eyebrow">{t("admin.syncTitle")}</h2>
        <p className="muted mt-2 text-sm">{t("admin.syncDesc")}</p>
        <button onClick={() => runSyncMutation.mutate()} disabled={runSyncMutation.isPending} className="btn-primary mt-4 disabled:opacity-50">
          {runSyncMutation.isPending ? t("admin.syncRunning") : t("admin.syncRun")}
        </button>

        {runSyncMutation.isSuccess ? (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {runSyncMutation.data}
          </p>
        ) : null}

        {runSyncMutation.isError ? (
          <div className="mt-3">
            <ErrorPanel error={runSyncMutation.error} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function extractTimestamp(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value !== "object") {
    return undefined;
  }

  const knownKeys = ["lastRunAt", "lastRun", "finishedAt", "startedAt", "createdAt", "updatedAt"];
  const record = value as Record<string, unknown>;

  for (const key of knownKeys) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }
  }

  for (const nestedValue of Object.values(record)) {
    const nestedTimestamp = extractTimestamp(nestedValue);
    if (nestedTimestamp) {
      return nestedTimestamp;
    }
  }

  return undefined;
}
