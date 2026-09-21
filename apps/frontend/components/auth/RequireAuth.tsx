"use client";

import type { Route } from "next";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { Spinner } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthContext";

function Loading() {
  return (
    <div className="flex justify-center py-20 text-brand-500">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();

  useEffect(() => {
    if (status === "ready" && !user) {
      router.replace(`/${params.locale}/login?next=${encodeURIComponent(pathname)}` as Route);
    }
  }, [status, user, router, pathname, params.locale]);

  if (status === "loading" || !user) {
    return <Loading />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, status, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale: string }>();

  useEffect(() => {
    if (status === "ready" && !user) {
      router.replace(`/${params.locale}/login?next=${encodeURIComponent(pathname)}` as Route);
    } else if (status === "ready" && user && !isAdmin) {
      router.replace(`/${params.locale}` as Route);
    }
  }, [status, user, isAdmin, router, pathname, params.locale]);

  if (status === "loading" || !user || !isAdmin) {
    return <Loading />;
  }

  return <>{children}</>;
}
