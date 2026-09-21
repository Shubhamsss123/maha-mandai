"use client";

import { usePathname, useRouter } from "next/navigation";
import { localeLabel, locales, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const onChange = (nextLocale: Locale) => {
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = nextLocale;
    router.push(`/${segments.join("/")}`);
  };

  return (
    <select
      className="rounded-md border border-brand-700 bg-white px-3 py-1 text-sm"
      value={locale}
      onChange={(event) => onChange(event.target.value as Locale)}
      aria-label="Change language"
    >
      {locales.map((item) => (
        <option key={item} value={item}>
          {localeLabel[item]}
        </option>
      ))}
    </select>
  );
}
