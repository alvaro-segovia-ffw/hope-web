"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ErrorPanel } from "@/components/error-panel";
import {
  useApartmentsGlobalSearchQuery,
  useApartmentsQuery,
} from "@/features/apartments/api/queries";
import { type Apartment } from "@/features/apartments/api/schemas";
import { useI18n } from "@/features/i18n/i18n-context";

const PER_PAGE = 20;

type SortOption =
  | "externalIdAsc"
  | "externalIdDesc"
  | "titleAsc"
  | "cityAsc"
  | "rentDesc"
  | "rentAsc";

type TFunction = (key: string, params?: Record<string, string | number>) => string;

const SORT_OPTIONS: Array<{ value: SortOption; labelKey: string }> = [
  { value: "externalIdAsc", labelKey: "apartments.sort.externalIdAsc" },
  { value: "externalIdDesc", labelKey: "apartments.sort.externalIdDesc" },
  { value: "titleAsc", labelKey: "apartments.sort.titleAsc" },
  { value: "cityAsc", labelKey: "apartments.sort.cityAsc" },
  { value: "rentDesc", labelKey: "apartments.sort.rentDesc" },
  { value: "rentAsc", labelKey: "apartments.sort.rentAsc" },
];

export function ApartmentsPageView() {
  const { t, locale } = useI18n();
  const [page, setPage] = useState(1);
  const [searchExternalId, setSearchExternalId] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("externalIdAsc");
  const apartmentsQuery = useApartmentsQuery(page, PER_PAGE);
  const globalSearchQuery = useApartmentsGlobalSearchQuery(searchExternalId);

  const isGlobalSearch = searchExternalId.trim().length > 0;

  const sourceItems = isGlobalSearch
    ? globalSearchQuery.data ?? []
    : apartmentsQuery.data?.items ?? [];

  const sortedItems = [...sourceItems].sort((a, b) => compareApartments(a, b, sortBy));

  const currentPageItems = isGlobalSearch
    ? sortedItems.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    : sortedItems;

  const totalPages = isGlobalSearch
    ? Math.max(1, Math.ceil(sortedItems.length / PER_PAGE))
    : apartmentsQuery.data?.total
      ? Math.max(1, Math.ceil(apartmentsQuery.data.total / PER_PAGE))
      : undefined;

  const canGoPrev = page > 1;
  const canGoNext = totalPages
    ? page < totalPages
    : (apartmentsQuery.data?.items.length ?? 0) === PER_PAGE;

  const visiblePages = useMemo(() => {
    if (!totalPages) {
      const pages = [Math.max(1, page - 1), page, page + 1];
      if (!canGoNext) {
        return Array.from(new Set(pages.filter((item) => item <= page))).sort((a, b) => a - b);
      }

      return Array.from(new Set(pages)).sort((a, b) => a - b);
    }

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    const pages: number[] = [];

    for (let index = start; index <= end; index += 1) {
      pages.push(index);
    }

    return pages;
  }, [canGoNext, page, totalPages]);

  const loadingState = isGlobalSearch ? globalSearchQuery.isLoading : apartmentsQuery.isLoading;
  const fetchingState = isGlobalSearch ? globalSearchQuery.isFetching : apartmentsQuery.isFetching;
  const errorState = isGlobalSearch ? globalSearchQuery.error : apartmentsQuery.error;
  const hasError = isGlobalSearch ? globalSearchQuery.isError : apartmentsQuery.isError;
  const isSuccess = isGlobalSearch ? globalSearchQuery.isSuccess : apartmentsQuery.isSuccess;
  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) {
      return;
    }

    if (totalPages && nextPage > totalPages) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <section className="space-y-6">
      <div className="surface-strong">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Portfolio Explorer</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-900">{t("apartments.title")}</h1>
            <p className="muted mt-2 text-sm">{t("apartments.subtitle")}</p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="searchExternalId">
                {t("apartments.searchLabel")}
              </label>
              <input
                id="searchExternalId"
                type="text"
                placeholder="1002"
                value={searchExternalId}
                onChange={(event) => {
                  setSearchExternalId(event.target.value);
                  setPage(1);
                }}
                className="field min-w-52"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="sortBy">
                {t("apartments.sortLabel")}
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="field min-w-52"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="surface">
        {loadingState ? (
          <p className="muted text-sm">{isGlobalSearch ? t("apartments.searchLoading") : t("apartments.loading")}</p>
        ) : null}

        {hasError && errorState ? <ErrorPanel error={errorState} /> : null}

        {isSuccess ? (
          <p className="muted mb-4 text-sm">
            {t("apartments.results", {
              count: currentPageItems.length,
              page,
              tail: isGlobalSearch
                ? t("apartments.resultsTailGlobal", { total: sortedItems.length })
                : apartmentsQuery.data?.total
                  ? t("apartments.resultsTailTotal", { total: apartmentsQuery.data.total })
                  : "",
            })}
          </p>
        ) : null}

        {isSuccess && sortedItems.length === 0 ? (
          <p className="muted text-sm">{t("apartments.empty")}</p>
        ) : null}

        {isSuccess && sortedItems.length > 0 ? (
          <div className="mb-4">
            <PaginationControls
              page={page}
              totalPages={totalPages}
              visiblePages={visiblePages}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
              fetchingState={fetchingState}
              onPageChange={handlePageChange}
              t={t}
            />
          </div>
        ) : null}

        {currentPageItems.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {currentPageItems.map((apartment) => {
              const title = getApartmentTitle(apartment);
              const location = getApartmentLocation(apartment, t);
              const rental = getApartmentRentLabel(apartment, locale, t);
              const photo = getApartmentPhoto(apartment);
              const metadata = getApartmentMeta(apartment, t);

              return (
                <li
                  key={apartment.externalId}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {photo ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={title} className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-slate-800">
                        ID {apartment.externalId}
                      </span>
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-slate-100 text-sm text-slate-500">
                      {t("apartments.noPhoto")}
                    </div>
                  )}

                  <div className="space-y-3 p-4">
                    <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">{title}</h2>
                    <p className="muted text-sm">{location}</p>
                    <p className="text-sm font-semibold text-[#8f6f2b]">{rental}</p>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      {metadata.map((item) => (
                        <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          {item}
                        </span>
                      ))}
                    </div>

                    <Link href={`/apartments/${apartment.externalId}`} className="btn-secondary inline-flex py-1.5">
                      {t("apartments.viewDetail")}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <div className="surface">
        <PaginationControls
          page={page}
          totalPages={totalPages}
          visiblePages={visiblePages}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          fetchingState={fetchingState}
          onPageChange={handlePageChange}
          t={t}
        />
      </div>
    </section>
  );
}

type PaginationControlsProps = {
  page: number;
  totalPages?: number;
  visiblePages: number[];
  canGoPrev: boolean;
  canGoNext: boolean;
  fetchingState: boolean;
  onPageChange: (page: number) => void;
  t: TFunction;
};

function PaginationControls({
  page,
  totalPages,
  visiblePages,
  canGoPrev,
  canGoNext,
  fetchingState,
  onPageChange,
  t,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="muted text-sm">
        {t("apartments.page", {
          page,
          total: totalPages ? t("apartments.pageOf", { total: totalPages }) : "",
        })}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onPageChange(1)} disabled={!canGoPrev || fetchingState} className="btn-secondary disabled:opacity-50">
          {t("apartments.first")}
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrev || fetchingState}
          className="btn-secondary disabled:opacity-50"
        >
          {t("apartments.prev")}
        </button>

        {visiblePages.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            disabled={fetchingState}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              pageNumber === page
                ? "bg-[#9a7a31] text-white"
                : "border border-slate-300 bg-white text-slate-700"
            } disabled:opacity-50`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext || fetchingState}
          className="btn-secondary disabled:opacity-50"
        >
          {t("apartments.next")}
        </button>

        <button
          onClick={() => {
            if (totalPages) {
              onPageChange(totalPages);
            }
          }}
          disabled={!totalPages || page === totalPages || fetchingState}
          className="btn-secondary disabled:opacity-50"
        >
          {t("apartments.last")}
        </button>
      </div>
    </div>
  );
}

function compareApartments(a: Apartment, b: Apartment, sortBy: SortOption): number {
  switch (sortBy) {
    case "externalIdDesc":
      return compareText(b.externalId, a.externalId);
    case "titleAsc":
      return compareText(getApartmentTitle(a), getApartmentTitle(b));
    case "cityAsc":
      return compareText(getApartmentCity(a), getApartmentCity(b));
    case "rentDesc":
      return compareNumber(getApartmentRentValue(b), getApartmentRentValue(a));
    case "rentAsc":
      return compareNumber(getApartmentRentValue(a), getApartmentRentValue(b));
    case "externalIdAsc":
    default:
      return compareText(a.externalId, b.externalId);
  }
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, "es", { numeric: true, sensitivity: "base" });
}

function compareNumber(a?: number, b?: number): number {
  if (a === undefined && b === undefined) {
    return 0;
  }

  if (a === undefined) {
    return 1;
  }

  if (b === undefined) {
    return -1;
  }

  return a - b;
}

function getApartmentTitle(apartment: Apartment): string {
  const canonical = getCanonical(apartment);
  return (
    toString(canonical.title) ??
    toString(canonical.name) ??
    apartment.title ??
    apartment.name ??
    `Apartment ${apartment.externalId}`
  );
}

function getApartmentCity(apartment: Apartment): string {
  const canonical = getCanonical(apartment);
  return toString(canonical.address?.city) ?? apartment.city ?? "";
}

function getApartmentLocation(apartment: Apartment, t: TFunction): string {
  const canonical = getCanonical(apartment);

  const parts = [
    toString(canonical.address?.streetName),
    toString(canonical.address?.buildingNumber),
    toString(canonical.address?.zipCode),
    toString(canonical.address?.city) ?? apartment.city,
    apartment.country,
  ].filter((item): item is string => Boolean(item));

  return parts.length > 0 ? parts.join(" ") : t("apartments.locationUnknown");
}

function getApartmentRentValue(apartment: Apartment): number | undefined {
  const canonical = getCanonical(apartment);
  if (typeof canonical.rent?.warmRent === "number") {
    return canonical.rent.warmRent;
  }

  return typeof apartment.price === "number" ? apartment.price : undefined;
}

function getApartmentRentLabel(apartment: Apartment, locale: string, t: TFunction): string {
  const canonical = getCanonical(apartment);
  const rent = getApartmentRentValue(apartment);
  const currency = canonical.rent?.currency ?? apartment.currency ?? "EUR";

  if (rent === undefined) {
    return t("apartments.rentUnknown");
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(rent);
  } catch {
    return `${rent} ${currency}`;
  }
}

function getApartmentPhoto(apartment: Apartment): string | undefined {
  const canonical = getCanonical(apartment);
  const photos = [canonical.photos, apartment.photos, apartment.images];

  for (const source of photos) {
    if (!Array.isArray(source)) {
      continue;
    }

    for (const item of source) {
      if (typeof item === "string" && item.length > 0) {
        return item;
      }

      if (item && typeof item === "object" && "url" in item) {
        const url = (item as { url?: unknown }).url;
        if (typeof url === "string" && url.length > 0) {
          return url;
        }
      }
    }
  }

  return undefined;
}

function getApartmentMeta(apartment: Apartment, t: TFunction): string[] {
  const canonical = getCanonical(apartment);
  const tags: string[] = [];

  if (canonical.roomsTotal !== undefined && canonical.roomsTotal !== null) {
    tags.push(t("apartments.metaRooms", { count: String(canonical.roomsTotal) }));
  }

  if (canonical.bedrooms !== undefined && canonical.bedrooms !== null) {
    tags.push(t("apartments.metaBedrooms", { count: String(canonical.bedrooms) }));
  }

  if (canonical.bathrooms !== undefined && canonical.bathrooms !== null) {
    tags.push(t("apartments.metaBathrooms", { count: String(canonical.bathrooms) }));
  }

  if (canonical.areaSqft !== undefined && canonical.areaSqft !== null) {
    tags.push(t("apartments.metaArea", { count: String(canonical.areaSqft) }));
  }

  return tags;
}

function getCanonical(apartment: Apartment) {
  const canonical = apartment.canonical;

  if (canonical && typeof canonical === "object") {
    return canonical as {
      title?: unknown;
      name?: unknown;
      photos?: unknown;
      roomsTotal?: unknown;
      bedrooms?: unknown;
      bathrooms?: unknown;
      areaSqft?: unknown;
      rent?: { warmRent?: number; currency?: string };
      address?: { streetName?: unknown; buildingNumber?: unknown; zipCode?: unknown; city?: unknown };
    };
  }

  return {} as {
    title?: unknown;
    name?: unknown;
    photos?: unknown;
    roomsTotal?: unknown;
    bedrooms?: unknown;
    bathrooms?: unknown;
    areaSqft?: unknown;
    rent?: { warmRent?: number; currency?: string };
    address?: { streetName?: unknown; buildingNumber?: unknown; zipCode?: unknown; city?: unknown };
  };
}

function toString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
