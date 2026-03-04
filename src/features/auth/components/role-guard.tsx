"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/features/auth/auth-context";
import { useI18n } from "@/features/i18n/i18n-context";

type RoleGuardProps = {
  requiredRole?: string;
  requiredRoles?: string[];
  children: ReactNode;
};

export function RoleGuard({ requiredRole, requiredRoles, children }: RoleGuardProps) {
  const { isReady, isAuthenticated, hasRole, login, roles } = useAuth();
  const { t } = useI18n();
  const rolesToCheck =
    requiredRoles && requiredRoles.length > 0
      ? requiredRoles
      : requiredRole
        ? [requiredRole]
        : [];
  const isAuthorized =
    rolesToCheck.length === 0 || rolesToCheck.some((candidateRole) => hasRole(candidateRole));

  if (!isReady) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4">{t("guard.checking")}</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-700">{t("guard.loginRequired")}</p>
        <button
          onClick={() => void login()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {t("guard.loginKeycloak")}
        </button>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">{t("guard.denied")}</h2>
        <p className="mt-2 text-sm text-red-800">
          {t("guard.roleMissing", {
            role: rolesToCheck.join(", "),
            roles: roles.join(", ") || "none",
          })}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
