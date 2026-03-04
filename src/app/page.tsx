"use client";

import Link from "next/link";

import { useI18n } from "@/features/i18n/i18n-context";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <section className="space-y-6">
      <article className="surface-strong relative overflow-hidden">
        <div className="absolute -right-8 -top-12 h-44 w-44 rounded-full bg-[#c59c62]/15 blur-2xl" />
        <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-[#9a7a31]/10 blur-2xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow">Enterprise Real Estate</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Digital Asset Operations for Residential Portfolios
            </h1>
            <p className="muted mt-4 max-w-2xl text-base sm:text-lg">{t("home.publicDesc")}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/apartments" className="btn-primary">
                {t("home.publicCta")}
              </Link>
              <Link href="/partner" className="btn-secondary">
                {t("home.partnerCta")}
              </Link>
              <Link href="/admin" className="btn-secondary">
                {t("home.internalCta")}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 self-end">
            <div className="surface border-slate-200/90 bg-white/80">
              <p className="eyebrow">{t("home.public")}</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{t("home.publicTitle")}</p>
            </div>
            <div className="surface border-slate-200/90 bg-white/80">
              <p className="eyebrow">{t("home.partner")}</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{t("home.partnerTitle")}</p>
            </div>
            <div className="surface border-slate-200/90 bg-white/80">
              <p className="eyebrow">{t("home.internal")}</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{t("home.internalTitle")}</p>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="surface lg:col-span-2">
          <p className="eyebrow">Public Access</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{t("home.publicTitle")}</h2>
          <p className="muted mt-2 text-sm">{t("home.publicDesc")}</p>
        </article>

        <article className="surface">
          <p className="eyebrow">Internal Access</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{t("home.internalTitle")}</h2>
          <p className="muted mt-2 text-sm">{t("home.internalDesc")}</p>
        </article>
      </div>
    </section>
  );
}
