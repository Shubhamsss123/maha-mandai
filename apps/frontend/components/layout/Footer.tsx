import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";

type Dict = Record<string, string>;

export function Footer({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="font-extrabold text-slate-900">{t.appName}</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">{t.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
            <Link href={`/${locale}/about`} className="hover:text-brand-700">
              About Us
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-brand-700">
              Contact Us
            </Link>
            <Link href={`/${locale}/privacy`} className="hover:text-brand-700">
              Privacy Policy
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-brand-700">
              Terms & Conditions
            </Link>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-400">
          © {new Date().getFullYear()} {t.appName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
