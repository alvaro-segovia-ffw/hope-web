"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { localeLabels, messages, type Locale } from "@/features/i18n/messages";

type TranslateParams = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: Array<{ code: Locale; label: string }>;
  t: (key: string, params?: TranslateParams) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "hope-web-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const storedLocale = window.localStorage.getItem(STORAGE_KEY);
    if (storedLocale === "en" || storedLocale === "de" || storedLocale === "es") {
      return storedLocale;
    }

    return "en";
  });

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
  };

  const t = (key: string, params?: TranslateParams) => {
    const template = messages[locale][key] ?? messages.en[key] ?? key;
    if (!params) {
      return template;
    }

    return Object.entries(params).reduce((result, [paramKey, value]) => {
      return result.replaceAll(`{${paramKey}}`, String(value));
    }, template);
  };

  const value: I18nContextValue = {
    locale,
    setLocale,
    locales: (Object.keys(localeLabels) as Locale[]).map((code) => ({
      code,
      label: localeLabels[code],
    })),
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
