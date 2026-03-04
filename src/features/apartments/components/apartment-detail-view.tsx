"use client";

import Link from "next/link";

import { ErrorPanel } from "@/components/error-panel";
import { useApartmentDetailQuery } from "@/features/apartments/api/queries";
import { type Apartment } from "@/features/apartments/api/schemas";
import { useI18n } from "@/features/i18n/i18n-context";

type ApartmentDetailViewProps = {
  externalId: string;
};

type PhotoItem = {
  url: string;
  title?: string;
  type?: string;
};

export function ApartmentDetailView({ externalId }: ApartmentDetailViewProps) {
  const { t, locale } = useI18n();
  const apartmentQuery = useApartmentDetailQuery(externalId);

  return (
    <section className="space-y-6">
      <div className="surface-strong">
        <p className="eyebrow">{t("detail.public")}</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-900">Apartment {externalId}</h1>
        <p className="muted mt-2 text-sm">Source: /api/v1/apartments/:externalId</p>
      </div>

      <div className="surface">
        {apartmentQuery.isLoading ? <p className="muted text-sm">{t("detail.loading")}</p> : null}
        {apartmentQuery.isError ? <ErrorPanel error={apartmentQuery.error} /> : null}
        {apartmentQuery.isSuccess ? <ApartmentVisualDetail apartment={apartmentQuery.data} locale={locale} /> : null}
      </div>

      <Link href="/apartments" className="btn-secondary inline-flex">
        {t("detail.back")}
      </Link>
    </section>
  );
}

function ApartmentVisualDetail({ apartment, locale }: { apartment: Apartment; locale: string }) {
  const { t } = useI18n();
  const canonical = getCanonical(apartment);
  const photos = getPhotos(apartment, canonical);

  const title =
    getString(canonical.title) ??
    getString(canonical.name) ??
    getString(apartment.title) ??
    getString(apartment.name) ??
    `Apartment ${apartment.externalId}`;

  const addressParts = [
    getString(canonical.address?.streetName),
    getString(canonical.address?.buildingNumber),
    getString(canonical.address?.zipCode),
    getString(canonical.address?.city),
  ].filter(Boolean);

  const features = getStringArray(canonical.features);
  const description = getString(canonical.description);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
            <p className="muted mt-1 text-sm">External ID: {apartment.externalId}</p>
            <p className="muted mt-1 text-sm">{addressParts.join(" ") || t("detail.addressUnavailable")}</p>
          </div>
          <button onClick={() => downloadAsJson(apartment)} className="btn-primary">
            {t("detail.export")}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label={t("detail.warmRent")} value={formatMoney(canonical.rent?.warmRent, canonical.rent?.currency, locale)} />
        <InfoCard label={t("detail.coldRent")} value={formatMoney(canonical.rent?.coldRent, canonical.rent?.currency, locale)} />
        <InfoCard label={t("detail.rooms")} value={toText(canonical.roomsTotal)} />
        <InfoCard label={t("detail.area")} value={formatArea(canonical.areaSqft, canonical.areaSqm, t)} />
        <InfoCard label={t("detail.bedrooms")} value={toText(canonical.bedrooms)} />
        <InfoCard label={t("detail.bathrooms")} value={toText(canonical.bathrooms)} />
        <InfoCard label={t("detail.deposit")} value={toText(canonical.deposit)} />
        <InfoCard label={t("detail.availability")} value={formatAvailability(canonical.availability, t)} />
      </div>

      {features.length > 0 ? (
        <div className="surface">
          <h3 className="eyebrow">{t("detail.features")}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {features.map((feature) => (
              <span key={feature} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                {feature}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {photos.length > 0 ? (
        <div className="surface">
          <h3 className="eyebrow">{t("detail.photos")}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <figure key={photo.url} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.title ?? "Apartment photo"} className="h-56 w-full object-cover" />
                <figcaption className="px-3 py-2 text-xs text-slate-600">{photo.title ?? photo.type ?? "Photo"}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <p className="muted text-sm">{t("detail.noPhotos")}</p>
      )}

      {description ? (
        <div className="surface">
          <h3 className="eyebrow">{t("detail.description")}</h3>
          <p className="muted mt-3 whitespace-pre-line text-sm">{description}</p>
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </article>
  );
}

function getCanonical(apartment: Apartment) {
  const canonical = apartment.canonical;

  if (canonical && typeof canonical === "object") {
    return canonical as Record<string, unknown> & {
      rent?: { warmRent?: number; coldRent?: number; currency?: string };
      address?: { streetName?: string; buildingNumber?: string; zipCode?: string; city?: string };
      availability?: { from?: string; until?: string | null };
      features?: unknown;
      title?: unknown;
      name?: unknown;
      roomsTotal?: unknown;
      areaSqft?: unknown;
      areaSqm?: unknown;
      bedrooms?: unknown;
      bathrooms?: unknown;
      deposit?: unknown;
      description?: unknown;
      photos?: unknown;
    };
  }

  return {} as Record<string, unknown> & {
    rent?: { warmRent?: number; coldRent?: number; currency?: string };
    address?: { streetName?: string; buildingNumber?: string; zipCode?: string; city?: string };
    availability?: { from?: string; until?: string | null };
    features?: unknown;
    title?: unknown;
    name?: unknown;
    roomsTotal?: unknown;
    areaSqft?: unknown;
    areaSqm?: unknown;
    bedrooms?: unknown;
    bathrooms?: unknown;
    deposit?: unknown;
    description?: unknown;
    photos?: unknown;
  };
}

function getPhotos(apartment: Apartment, canonical: ReturnType<typeof getCanonical>): PhotoItem[] {
  const topLevelPhotos = normalizePhotos(apartment.photos);
  const canonicalPhotos = normalizePhotos(canonical.photos);

  const unique = new Map<string, PhotoItem>();
  for (const photo of [...topLevelPhotos, ...canonicalPhotos]) {
    unique.set(photo.url, photo);
  }

  return [...unique.values()];
}

function normalizePhotos(value: unknown): PhotoItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      url: getString(item.url) ?? "",
      title: getString(item.title),
      type: getString(item.type),
    }))
    .filter((photo) => photo.url.length > 0);
}

function downloadAsJson(apartment: Apartment) {
  const blob = new Blob([JSON.stringify(apartment, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `apartment-${apartment.externalId}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return String(value);
}

function formatMoney(value: unknown, currency: unknown, locale: string): string {
  if (typeof value !== "number") {
    return "-";
  }

  const currencyCode = typeof currency === "string" && currency ? currency : "EUR";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currencyCode}`;
  }
}

function formatAvailability(
  value: unknown,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (!value || typeof value !== "object") {
    return "-";
  }

  const from = getString((value as { from?: unknown }).from);
  const until = getString((value as { until?: unknown }).until);

  if (!from && !until) {
    return "-";
  }

  return `${from ?? "?"} - ${until ?? t("detail.availabilityOpen")}`;
}

function formatArea(
  areaSqft: unknown,
  areaSqm: unknown,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  const parts: string[] = [];

  if (areaSqft !== undefined && areaSqft !== null) {
    parts.push(t("detail.areaSqft", { count: String(areaSqft) }));
  }

  if (areaSqm !== undefined && areaSqm !== null) {
    parts.push(t("detail.areaSqm", { count: String(areaSqm) }));
  }

  return parts.length > 0 ? parts.join(" / ") : "-";
}
