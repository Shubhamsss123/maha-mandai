"use client";

import { use, useEffect, useState } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert, EmptyState } from "@/components/ui/Feedback";
import { Container, PageHeader } from "@/components/ui/PageHeader";
import { apiDelete, apiGet, apiPut } from "@/lib/api/client";
import { Locale } from "@/lib/i18n/config";

type CartItem = {
  id: number;
  product_id: number;
  name_en: string;
  name_mr: string;
  quantity: number;
  line_mrp: number;
  line_sale: number;
};

type CartResponse = {
  cart_id: number;
  items: CartItem[];
  total_mrp: number;
  total_sale: number;
  total_savings: number;
};

function CartContent({ locale }: { locale: Locale }) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () => {
    apiGet<CartResponse>("/api/v1/cart")
      .then(setCart)
      .catch((err: Error) => setError(err.message));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuantity = async (itemId: number, quantity: number) => {
    setBusyId(itemId);
    setError("");
    try {
      if (quantity <= 0) {
        await apiDelete(`/api/v1/cart/items/${itemId}`);
      } else {
        await apiPut(`/api/v1/cart/items/${itemId}`, { quantity });
      }
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update cart");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Container className="max-w-3xl">
      <PageHeader title="Your Cart" subtitle="Review items before checkout." />
      {error ? (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-6">
        {!cart || cart.items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Add some fresh produce to get started."
            icon="🛒"
            action={<Button href={`/${locale}/products`}>Browse Products</Button>}
          />
        ) : (
          <>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <Card key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{locale === "mr" ? item.name_mr : item.name_en}</p>
                    <p className="mt-1 text-sm text-slate-500">₹{item.line_sale}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-brand-100 text-slate-600 hover:bg-brand-50 disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-brand-100 text-slate-600 hover:bg-brand-50 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-6 space-y-1.5 bg-brand-50/50">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Total MRP</span>
                <span>₹{cart.total_mrp}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Total Sale Price</span>
                <span>₹{cart.total_sale}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-emerald-700">
                <span>You Save</span>
                <span>₹{cart.total_savings}</span>
              </div>
            </Card>

            <Button href={`/${locale}/checkout`} className="mt-5" size="lg">
              Proceed to Checkout →
            </Button>
          </>
        )}
      </div>
    </Container>
  );
}

export default function CartPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  return (
    <RequireAuth>
      <CartContent locale={resolvedParams.locale} />
    </RequireAuth>
  );
}
