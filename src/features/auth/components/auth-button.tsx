"use client";

import { useAuth } from "@/features/auth/auth-context";
import { useI18n } from "@/features/i18n/i18n-context";

export function AuthButton() {
  const { isReady, isAuthenticated, username, login, logout } = useAuth();
  const { t } = useI18n();

  if (!isReady) {
    return (
      <button className="btn-secondary min-w-32" disabled>
        {t("auth.loading")}
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <button onClick={() => void login()} className="btn-primary min-w-28">
        {t("auth.login")}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-600">
        {username ?? t("auth.userFallback")}
      </span>
      <button onClick={() => void logout()} className="btn-secondary">
        {t("auth.logout")}
      </button>
    </div>
  );
}
