"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert, EmptyState, PageSkeleton } from "@/components/ui/Feedback";
import { Container, PageHeader } from "@/components/ui/PageHeader";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { Locale } from "@/lib/i18n/config";

type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  original_price: number;
  discounted_price: number;
  savings: number;
  discount_percentage: number;
  stock_quantity: number;
  image_url: string | null;
};

type CartItem = {
  id: number;
  product_id: number;
  quantity: number;
};

type CartResponse = {
  cart_id: number;
  items: CartItem[];
  total_mrp: number;
  total_sale: number;
  total_savings: number;
};

export default function ProductsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [cartByProduct, setCartByProduct] = useState<Record<number, CartItem>>({});
  const [cartTotals, setCartTotals] = useState<{ count: number; amount: number }>({ count: 0, amount: 0 });

  useEffect(() => {
    apiGet<Product[]>(`/api/v1/products?locale=${resolvedParams.locale}`)
      .then(setProducts)
      .catch((err: Error) => setError(err.message));
  }, [resolvedParams.locale]);

  const loadCart = () => {
    if (!user) {
      setCartByProduct({});
      setCartTotals({ count: 0, amount: 0 });
      return;
    }
    apiGet<CartResponse>("/api/v1/cart")
      .then((cart) => {
        const map: Record<number, CartItem> = {};
        let count = 0;
        for (const item of cart.items) {
          map[item.product_id] = item;
          count += item.quantity;
        }
        setCartByProduct(map);
        setCartTotals({ count, amount: cart.total_sale });
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addToCart = async (productId: number) => {
    if (!user) {
      router.push(`/${resolvedParams.locale}/login?next=${encodeURIComponent(`/${resolvedParams.locale}/products`)}`);
      return;
    }
    setError("");
    setBusyId(productId);
    try {
      await apiPost("/api/v1/cart/items", { product_id: productId, quantity: 1 });
      loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add to cart");
    } finally {
      setBusyId(null);
    }
  };

  const changeQuantity = async (product: Product, nextQuantity: number) => {
    const existing = cartByProduct[product.id];
    if (!existing) return;
    setError("");
    setBusyId(product.id);
    try {
      if (nextQuantity <= 0) {
        await apiDelete(`/api/v1/cart/items/${existing.id}`);
      } else {
        await apiPut(`/api/v1/cart/items/${existing.id}`, { quantity: nextQuantity });
      }
      loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update cart");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Container className="max-w-6xl">
      <PageHeader title="Products" subtitle="Fresh picks, straight from the mandai." />

      {error ? (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-6">
        {products === null ? (
          <PageSkeleton />
        ) : products.length === 0 ? (
          <EmptyState title="No products available" description="Please check back soon." icon="🧺" />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const cartItem = cartByProduct[product.id];
              const quantity = cartItem?.quantity ?? 0;
              const isBusy = busyId === product.id;

              return (
                <Card key={product.id} className="flex flex-col">
                  <div className="flex h-24 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">🥬</span>
                    )}
                  </div>
                  <h2 className="mt-3 font-semibold text-slate-900">{product.name}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{product.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-sm font-bold text-brand-700">₹{product.discounted_price}</p>
                    <p className="text-xs text-slate-400 line-through">₹{product.original_price}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {product.discount_percentage > 0 ? <Badge variant="accent">Save {product.discount_percentage}%</Badge> : null}
                    {product.stock_quantity <= 0 ? (
                      <Badge variant="danger">Out of stock</Badge>
                    ) : product.stock_quantity <= 5 ? (
                      <Badge variant="warning">Only {product.stock_quantity} left</Badge>
                    ) : null}
                  </div>

                  {quantity > 0 ? (
                    <div className="mt-3 flex h-9 w-full items-center justify-center gap-3 rounded-lg bg-brand-600 px-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => changeQuantity(product, quantity - 1)}
                        className="grid h-6 w-6 place-items-center rounded-md bg-white/20 text-white hover:bg-white/30 disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-semibold text-white">{quantity}</span>
                      <button
                        type="button"
                        disabled={isBusy || quantity >= product.stock_quantity}
                        onClick={() => changeQuantity(product, quantity + 1)}
                        className="grid h-6 w-6 place-items-center rounded-md bg-white/20 text-white hover:bg-white/30 disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <Button
                      className="mt-3 h-9"
                      size="sm"
                      fullWidth
                      isLoading={isBusy}
                      disabled={product.stock_quantity <= 0}
                      onClick={() => addToCart(product.id)}
                      type="button"
                    >
                      Add to Cart
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {cartTotals.count > 0 ? (
        <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-white/95 px-4 py-3 shadow-soft backdrop-blur">
          <div>
            <p className="text-xs text-slate-500">
              {cartTotals.count} {cartTotals.count === 1 ? "item" : "items"}
            </p>
            <p className="text-lg font-bold text-slate-900">₹{cartTotals.amount}</p>
          </div>
          <Button size="lg" onClick={() => router.push(`/${resolvedParams.locale}/cart`)} type="button">
            Proceed →
          </Button>
        </div>
      ) : null}
    </Container>
  );
}
