"use client";

import type { Route } from "next";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { Button } from "@/components/ui/Button";
import { SelectableCard } from "@/components/ui/Card";
import { Alert, EmptyState } from "@/components/ui/Feedback";
import { Container, PageHeader } from "@/components/ui/PageHeader";
import { apiGet, apiPost } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

type Address = {
  id: number;
  full_name: string;
  house: string;
  street: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  is_default: boolean;
};

type CheckoutResponse = {
  order_id: number;
  status: string;
  total_amount: number;
};

const paymentOptions = [
  { value: "cod", label: "Cash on Delivery", icon: "💵", description: "Pay when your order arrives", disabled: false },
  { value: "online", label: "Online Payment", icon: "💳", description: "Coming soon", disabled: true },
] as const;

function CheckoutContent() {
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);
  const paymentMethod = "cod" as const;
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiGet<Address[]>("/api/v1/addresses")
      .then((rows) => {
        setAddresses(rows);
        const selectedId = Number(searchParams.get("selectedAddressId"));
        const requested = rows.find((item) => item.id === selectedId);
        const preferred = requested || rows.find((item) => item.is_default) || rows[0];
        if (preferred) {
          setAddressId(preferred.id);
        }
      })
      .catch((err: Error) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!addressId) {
      setError("Please select a delivery address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const checkout = await apiPost<CheckoutResponse>("/api/v1/orders/checkout", {
        address_id: addressId,
        payment_method: paymentMethod,
      });
      router.push(`/${params.locale}/order-placed/${checkout.order_id}` as Route);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="max-w-2xl">
      <PageHeader title="Checkout" subtitle="Confirm your delivery details and payment method." />

      {error ? (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}
      {user && !user.is_verified ? (
        <div className="mt-4">
          <Alert variant="warning">
            Your account isn&apos;t verified yet. You can review your order below, but placing it will be blocked until
            your account is verified.
          </Alert>
        </div>
      ) : null}

      {addresses !== null && addresses.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No delivery address yet"
            description="Add an address before placing your order."
            icon="📍"
            action={<Button href={`/${params.locale}/addresses?returnTo=checkout`}>Add Address</Button>}
          />
        </div>
      ) : (
        <form className="mt-6 space-y-6" onSubmit={onSubmit}>
          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Delivery Address</h2>
            <div className="space-y-2">
              {(addresses ?? []).map((address) => (
                <SelectableCard
                  key={address.id}
                  selected={addressId === address.id}
                  onClick={() => setAddressId(address.id)}
                >
                  <p className="font-medium text-slate-900">
                    {address.full_name} {address.is_default ? <span className="text-xs text-brand-600">(Default)</span> : null}
                  </p>
                  <p className="text-sm text-slate-500">
                    {address.house}, {address.street}, {address.area}, {address.city} - {address.pincode}
                  </p>
                </SelectableCard>
              ))}
            </div>
            <Button
              href={`/${params.locale}/addresses?returnTo=checkout`}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              + Add New Address
            </Button>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Payment Method</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {paymentOptions.map((option) => (
                <SelectableCard
                  key={option.value}
                  selected={paymentMethod === option.value}
                  disabled={option.disabled}
                  onClick={() => {}}
                  className={option.disabled ? "cursor-not-allowed opacity-50" : undefined}
                >
                  <span className="text-xl">{option.icon}</span>
                  <p className="mt-1 font-medium text-slate-900">{option.label}</p>
                  <p className="text-xs text-slate-500">{option.description}</p>
                </SelectableCard>
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting} disabled={user ? !user.is_verified : false}>
            {user && !user.is_verified ? "Account Not Verified" : "Place Order"}
          </Button>
        </form>
      )}
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutContent />
    </RequireAuth>
  );
}
