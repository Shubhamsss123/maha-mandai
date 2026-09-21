"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiGet, apiPost } from "@/lib/api/client";

export type CurrentUser = {
  id: number;
  mobile_number: string;
  role: "customer" | "admin" | "order_manager";
  is_verified: boolean;
  created_at: string;
};

type AuthStatus = "loading" | "ready";

type AuthContextValue = {
  user: CurrentUser | null;
  status: AuthStatus;
  isAdmin: boolean;
  isFullAdmin: boolean;
  refresh: () => Promise<void>;
  setSession: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const REFRESH_TOKEN_KEY = "maha_refresh_token";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const me = await apiGet<CurrentUser>("/api/v1/users/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSession = useCallback(
    async (tokens: { access_token: string; refresh_token: string }) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
      }
      await refresh();
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    const refreshToken = typeof window !== "undefined" ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
    try {
      if (refreshToken) {
        await apiPost("/api/v1/auth/logout", { refresh_token: refreshToken });
      }
    } catch {
      // ignore - cookies may already be invalid
    } finally {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAdmin: user?.role === "admin" || user?.role === "order_manager",
      isFullAdmin: user?.role === "admin",
      refresh,
      setSession,
      logout,
    }),
    [user, status, refresh, setSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
