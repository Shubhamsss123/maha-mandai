"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, PageSkeleton } from "@/components/ui/Feedback";
import { Container } from "@/components/ui/PageHeader";
import { apiGet } from "@/lib/api/client";
import { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

type Product = {
  id: number;
  slug: string;
  name: string;
  discounted_price: number;
  original_price: number;
  discount_percentage: number;
  image_url: string | null;
};

const perks = [
  { icon: "🌱", titleKey: "perkFresh", descKey: "perkFreshDesc" },
  { icon: "🚚", titleKey: "perkFast", descKey: "perkFastDesc" },
  { icon: "💸", titleKey: "perkPrice", descKey: "perkPriceDesc" },
  { icon: "📍", titleKey: "perkArea", descKey: "perkAreaDesc" },
] as const;

export default function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const t = getDictionary(resolvedParams.locale);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    apiGet<Product[]>(`/api/v1/products?locale=${resolvedParams.locale}`)
      .then((rows) => setProducts(rows.slice(0, 4)))
      .catch(() => setProducts([]));
  }, [resolvedParams.locale]);

  return (
    <Container>
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-14 text-white sm:px-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-100">{t.tagline}</p>
        <h1 className="mt-3 max-w-xl text-3xl font-bold sm:text-4xl">{t.heroTitle}</h1>
        <p className="mt-4 max-w-xl text-brand-50">{t.heroSubtitle}</p>
        <div className="mt-7">
          <Button href={`/${resolvedParams.locale}/products`} variant="accent" size="lg">
            {t.shopNow} →
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {perks.map((perk) => (
          <Card key={perk.titleKey} className="text-center">
            <span className="text-2xl">{perk.icon}</span>
            <p className="mt-2 text-sm font-semibold text-slate-900">{t[perk.titleKey]}</p>
            <p className="mt-1 text-xs text-slate-500">{t[perk.descKey]}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.featured}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.featuredSubtitle}</p>
          </div>
          <Link href={`/${resolvedParams.locale}/products`} className="text-sm font-semibold text-brand-700 hover:underline">
            {t.viewAll}
          </Link>
        </div>

        <div className="mt-6">
          {products === null ? (
            <PageSkeleton />
          ) : products.length === 0 ? (
            <EmptyState title="No products yet" description="Check back soon — we're stocking the shelves." icon="🧺" />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <div className="flex h-24 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">🥕</span>
                    )}
                  </div>
                  <p className="mt-3 font-semibold text-slate-900">{product.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-sm font-bold text-brand-700">₹{product.discounted_price}</p>
                    <p className="text-xs text-slate-400 line-through">₹{product.original_price}</p>
                  </div>
                  {product.discount_percentage > 0 ? (
                    <div className="mt-2">
                      <Badge variant="accent">{product.discount_percentage}% off</Badge>
                    </div>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
