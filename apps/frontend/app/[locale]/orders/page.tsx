"use client";

import { useEffect, useState } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Alert, EmptyState, PageSkeleton } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { Container, PageHeader } from "@/components/ui/PageHeader";
import { apiGet } from "@/lib/api/client";

type Order = {
  id: number;
  total_amount: number;
  order_status: string;
  payment_status: string;
  created_at: string;
};

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
  order: Order & { payment_method: string };
  items: OrderItem[];
  address: Address | null;
};

function OrdersContent() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    apiGet<Order[]>("/api/v1/orders")
      .then(setOrders)
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (selectedOrderId === null) return;
    setDetail(null);
    setDetailError("");
    apiGet<OrderDetail>(`/api/v1/orders/${selectedOrderId}`)
      .then(setDetail)
      .catch((err: Error) => setDetailError(err.message));
  }, [selectedOrderId]);

  return (
    <Container className="max-w-3xl">
      <PageHeader title="My Orders" subtitle="Track your past and current orders." />
      {error ? (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-6">
        {orders === null ? (
          <PageSkeleton />
        ) : orders.length === 0 ? (
          <EmptyState title="No orders yet" description="Your placed orders will show up here." icon="📦" />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <button key={order.id} type="button" className="w-full text-left" onClick={() => setSelectedOrderId(order.id)}>
                <Card className="flex items-center justify-between transition hover:border-brand-300">
                  <div>
                    <p className="font-semibold text-slate-900">Order #{order.id}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()} · ₹{order.total_amount}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <OrderStatusBadge status={order.order_status} />
                    <span className="text-xs text-slate-400">Payment: {order.payment_status}</span>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        title={selectedOrderId ? `Order #${selectedOrderId}` : "Order"}
      >
        {detailError ? <Alert variant="error">{detailError}</Alert> : null}
        {!detail && !detailError ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
          </div>
        ) : null}
        {detail ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={detail.order.order_status} />
              <span className="text-xs text-slate-500">{new Date(detail.order.created_at).toLocaleString()}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {detail.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-slate-900">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-sm font-semibold text-slate-700">Total</span>
              <span className="text-lg font-bold text-slate-900">₹{detail.order.total_amount}</span>
            </div>
            <p className="text-xs text-slate-500">
              Payment: {detail.order.payment_method.toUpperCase()} · {detail.order.payment_status}
            </p>

            {detail.address ? (
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Delivered To</h3>
                <p className="mt-1 font-medium text-slate-900">{detail.address.full_name}</p>
                <p className="text-sm text-slate-500">
                  {detail.address.house}, {detail.address.street}, {detail.address.area}, {detail.address.city} -{" "}
                  {detail.address.pincode}
                </p>
                <p className="mt-1 text-sm text-slate-500">{detail.address.phone}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </Container>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}
