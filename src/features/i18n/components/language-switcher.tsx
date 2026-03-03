"use client";

import { useI18n } from "@/features/i18n/i18n-context";
import { type Locale } from "@/features/i18n/messages";

export function LanguageSwitcher() {
  const { locale, setLocale, locales } = useI18n();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      className="field w-32 py-1.5"
    >
      {locales.map((item) => (
        <option key={item.code} value={item.code}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
