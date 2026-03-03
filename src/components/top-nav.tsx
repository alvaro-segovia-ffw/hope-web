"use client";

import Image from "next/image";
import Link from "next/link";

import { AuthButton } from "@/features/auth/components/auth-button";
import { useAuth } from "@/features/auth/auth-context";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { useI18n } from "@/features/i18n/i18n-context";

export function TopNav() {
  const { isAuthenticated, hasRole } = useAuth();
  const { t } = useI18n();
  const isAdmin = isAuthenticated && hasRole("admin");

  return (
    <header className="sticky top-0 z-40 border-b border-[#d8cfbc]/80 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[#d8cfbc] bg-[#f4efe4]">
              <Image src="/image.png" alt="Hope Apartments logo" width={36} height={36} />
            </span>
            <span className="font-['Avenir_Next'] text-lg font-semibold tracking-tight text-[#2f2a20]">
              {t("nav.brand")}
            </span>
          </Link>

          <nav className="flex items-center gap-2 rounded-xl border border-[#d9d0be] bg-[#f6f1e7]/90 p-1 text-sm text-[#59564c]">
            <Link href="/apartments" className="rounded-lg px-3 py-1.5 transition hover:bg-white hover:text-[#2f2a20]">
              {t("nav.apartments")}
            </Link>
            <Link
              href="/admin"
              className={`rounded-lg px-3 py-1.5 transition hover:bg-white hover:text-[#2f2a20] ${
                isAdmin ? "" : "opacity-70"
              }`}
            >
              {t("nav.admin")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
