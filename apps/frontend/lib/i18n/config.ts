export const locales = ["en", "mr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabel: Record<Locale, string> = {
  en: "English",
  mr: "मराठी",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
