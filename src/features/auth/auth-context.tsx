"use client";

import Keycloak, { type KeycloakInitOptions, type KeycloakTokenParsed } from "keycloak-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { env } from "@/lib/env/client-env";

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  token?: string;
  username?: string;
  roles: string[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const keycloakRef = useRef<Keycloak | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [tokenParsed, setTokenParsed] = useState<KeycloakTokenParsed | undefined>(undefined);

  useEffect(() => {
    const keycloak = new Keycloak({
      url: env.NEXT_PUBLIC_KEYCLOAK_URL,
      realm: env.NEXT_PUBLIC_KEYCLOAK_REALM,
      clientId: env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    });

    keycloakRef.current = keycloak;

    const initOptions: KeycloakInitOptions = {
      onLoad: "check-sso",
      pkceMethod: "S256",
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    };

    keycloak
      .init(initOptions)
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        setToken(keycloak.token);
        setTokenParsed(keycloak.tokenParsed);
      })
      .catch((error) => {
        console.error("Keycloak init failed", error);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  useEffect(() => {
    if (!keycloakRef.current || !isAuthenticated) {
      return;
    }

    const refreshTimer = window.setInterval(async () => {
      const keycloak = keycloakRef.current;

      if (!keycloak) {
        return;
      }

      try {
        const refreshed = await keycloak.updateToken(30);
        if (refreshed) {
          setToken(keycloak.token);
          setTokenParsed(keycloak.tokenParsed);
        }
      } catch {
        setIsAuthenticated(false);
        setToken(undefined);
        setTokenParsed(undefined);
      }
    }, 20_000);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [isAuthenticated]);

  const login = useCallback(async () => {
    if (!keycloakRef.current) {
      return;
    }

    await keycloakRef.current.login({ redirectUri: window.location.href });
  }, []);

  const logout = useCallback(async () => {
    if (!keycloakRef.current) {
      return;
    }

    await keycloakRef.current.logout({ redirectUri: window.location.origin });
  }, []);

  const roles = useMemo(() => {
    if (!tokenParsed) {
      return [];
    }

    const realmRoles = tokenParsed.realm_access?.roles ?? [];
    const clientRoles =
      tokenParsed.resource_access?.[env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID]?.roles ?? [];

    return Array.from(new Set([...realmRoles, ...clientRoles]));
  }, [tokenParsed]);

  const hasRole = useCallback(
    (role: string) => {
      return roles.includes(role);
    },
    [roles],
  );

  const username =
    typeof tokenParsed?.preferred_username === "string"
      ? tokenParsed.preferred_username
      : undefined;

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated,
      token,
      username,
      roles,
      login,
      logout,
      hasRole,
    }),
    [hasRole, isAuthenticated, isReady, login, logout, roles, token, username],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
