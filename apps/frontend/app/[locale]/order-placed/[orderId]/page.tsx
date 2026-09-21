"use client";

import { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert, PageSkeleton } from "@/components/ui/Feedback";
import { Container } from "@/components/ui/PageHeader";
import { apiGet } from "@/lib/api/client";
import { Locale } from "@/lib/i18n/config";

type OrderItem = {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type Address = {
  full_name: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
};

type OrderDetail = {
  order: {
    id: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    created_at: string;
  };
  items: OrderItem[];
  address: Address | null;
};

function OrderPlacedContent({ orderId }: { orderId: string }) {
  const params = useParams<{ locale: string }>();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<OrderDetail>(`/api/v1/orders/${orderId}`)
      .then(setDetail)
      .catch((err: Error) => setError(err.message));
  }, [orderId]);

  return (
    <Container className="max-w-2xl">
      <div className="flex flex-col items-center text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">✅</span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Order Placed!</h1>
        <p className="mt-1 text-sm text-slate-500">Thanks for shopping with Maha Mandai.</p>
      </div>

      {error ? (
        <div className="mt-6">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-6">
        {detail === null && !error ? (
          <PageSkeleton />
        ) : detail ? (
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">Order #{detail.order.id}</p>
                <OrderStatusBadge status={detail.order.order_status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(detail.order.created_at).toLocaleString()}
              </p>
              <div className="mt-4 divide-y divide-slate-100">
                {detail.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-slate-900">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-sm font-semibold text-slate-700">Total</span>
                <span className="text-lg font-bold text-slate-900">₹{detail.order.total_amount}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Payment: {detail.order.payment_method.toUpperCase()} · {detail.order.payment_status}
              </p>
            </Card>

            {detail.address ? (
              <Card>
                <h2 className="text-sm font-semibold text-slate-700">Delivering To</h2>
                <p className="mt-1 font-medium text-slate-900">{detail.address.full_name}</p>
                <p className="text-sm text-slate-500">
                  {detail.address.house}, {detail.address.street}, {detail.address.area}, {detail.address.city} -{" "}
                  {detail.address.pincode}
                </p>
                <p className="mt-1 text-sm text-slate-500">{detail.address.phone}</p>
              </Card>
            ) : null}

            <div className="flex gap-3">
              <Button href={`/${params.locale}/orders`} variant="outline" fullWidth>
                View All Orders
              </Button>
              <Button href={`/${params.locale}/products`} fullWidth>
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Container>
  );
}

export default function OrderPlacedPage({ params }: { params: Promise<{ locale: Locale; orderId: string }> }) {
  const resolvedParams = use(params);
  return (
    <RequireAuth>
      <OrderPlacedContent orderId={resolvedParams.orderId} />
    </RequireAuth>
  );
}
