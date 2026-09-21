import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "http://localhost:3000";
  const paths = ["", "/products", "/login", "/addresses", "/cart", "/checkout", "/orders", "/about", "/privacy", "/terms", "/contact"];

  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.7,
    }))
  );
}
