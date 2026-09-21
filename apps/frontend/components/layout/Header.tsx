"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import { useAuth } from "@/lib/auth/AuthContext";

type Dict = Record<string, string>;

export function Header({ locale, t }: { locale: Locale; t: Dict }) {
  const { user, isAdmin, isFullAdmin, status, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push(`/${locale}` as Route);
  };

  const navLinks: Array<{ href: Route; label: string }> = [
    { href: `/${locale}/products` as Route, label: t.products },
  ];
  if (user) {
    navLinks.push(
      { href: `/${locale}/cart` as Route, label: t.cart },
      { href: `/${locale}/orders` as Route, label: t.orders },
      { href: `/${locale}/addresses` as Route, label: t.addresses }
    );
  }
  if (isAdmin) {
    navLinks.push({ href: `/${locale}/admin` as Route, label: t.adminDashboard });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-lg text-white">
            🥬
          </span>
          <span className="font-extrabold tracking-tight text-slate-900">{t.appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === link.href ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher locale={locale} />
          {status === "ready" && user ? (
            <div className="flex items-center gap-2">
              {isAdmin ? <Badge variant="accent">{isFullAdmin ? "Admin" : "Order Manager"}</Badge> : null}
              <span className="text-sm text-slate-500">{user.mobile_number}</span>
              <Button variant="outline" size="sm" onClick={onLogout} type="button">
                {t.logout}
              </Button>
            </div>
          ) : (
            <Button href={`/${locale}/login`} size="sm">
              {t.login}
            </Button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-brand-100 text-slate-600 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-brand-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-brand-100 pt-3">
            <LanguageSwitcher locale={locale} />
            {status === "ready" && user ? (
              <Button variant="outline" size="sm" onClick={onLogout} type="button">
                {t.logout}
              </Button>
            ) : (
              <Button href={`/${locale}/login`} size="sm">
                {t.login}
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
