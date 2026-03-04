"use client";

import { useState } from "react";

import { ErrorPanel } from "@/components/error-panel";
import { getAllApartmentsBySource } from "@/features/apartments/api/apartments-api";
import { useApartmentsTotalCountQuery } from "@/features/apartments/api/queries";
import { useI18n } from "@/features/i18n/i18n-context";

export function PartnerDashboard() {
  const { t } = useI18n();
  const [exportError, setExportError] = useState<unknown>(undefined);
  const [isExporting, setIsExporting] = useState(false);

  const rentCountQuery = useApartmentsTotalCountQuery("availableForRent");

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(undefined);

    try {
      const apartments = await getAllApartmentsBySource("availableForRent");
      const payload = {
        exportedAt: new Date().toISOString(),
        total: apartments.length,
        items: apartments,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      anchor.href = url;
      anchor.download = `apartments-available-for-rent-${date}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="surface-strong">
        <p className="eyebrow">Partner Workspace</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900">{t("partner.title")}</h1>
        <p className="muted mt-2 text-sm">{t("partner.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="surface bg-gradient-to-br from-white to-slate-50">
          <h2 className="eyebrow">{t("partner.rentCount")}</h2>
          {rentCountQuery.isLoading ? <p className="muted mt-3 text-sm">{t("partner.loading")}</p> : null}
          {rentCountQuery.isError ? (
            <div className="mt-3">
              <ErrorPanel error={rentCountQuery.error} />
            </div>
          ) : null}
          {rentCountQuery.isSuccess ? (
            <p className="mt-3 text-5xl font-semibold text-[#8f6f2b]">{rentCountQuery.data}</p>
          ) : null}
        </article>

        <article className="surface bg-gradient-to-br from-white to-slate-50">
          <h2 className="eyebrow">{t("partner.source")}</h2>
          <p className="mt-3 text-sm font-medium text-slate-700">/api/v1/apartments/available-for-rent</p>
          <p className="muted mt-2 text-sm">{t("partner.exportDesc")}</p>
        </article>
      </div>

      <div className="surface">
        <h2 className="eyebrow">{t("partner.exportTitle")}</h2>
        <p className="muted mt-2 text-sm">{t("partner.exportHelp")}</p>

        <button onClick={() => void handleExport()} disabled={isExporting} className="btn-primary mt-4 disabled:opacity-50">
          {isExporting ? t("partner.exporting") : t("partner.export")}
        </button>

        {exportError ? (
          <div className="mt-3">
            <ErrorPanel error={exportError} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
