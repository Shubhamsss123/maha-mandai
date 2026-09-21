"use client";

import type { Route } from "next";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert, EmptyState } from "@/components/ui/Feedback";
import { Input } from "@/components/ui/Field";
import { Container, PageHeader } from "@/components/ui/PageHeader";
import { apiDelete, apiGet, apiPost } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

type Address = {
  id: number;
  full_name: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

const emptyForm = {
  full_name: "",
  phone: "",
  house: "",
  street: "",
  landmark: "",
  area: "",
  city: "Baramati",
  state: "Maharashtra",
  pincode: "",
  is_default: true,
};

const fields: Array<[key: keyof typeof emptyForm, label: string]> = [
  ["full_name", "Full Name"],
  ["phone", "Phone"],
  ["house", "House / Flat"],
  ["street", "Street"],
  ["landmark", "Landmark"],
  ["area", "Area"],
  ["city", "City"],
  ["state", "State"],
  ["pincode", "PIN Code"],
];

function AddressesContent() {
  const { user } = useAuth();
  const params = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const localPhone = user?.mobile_number ? user.mobile_number.slice(-10) : "";
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const reload = () => {
    apiGet<Address[]>("/api/v1/addresses")
      .then(setAddresses)
      .catch((err: Error) => setError(err.message));
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (!localPhone) return;
    setForm((prev) => (prev.phone ? prev : { ...prev, phone: localPhone }));
  }, [localPhone]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);
    try {
      const created = await apiPost<Address>("/api/v1/addresses", form);
      if (returnTo === "checkout") {
        router.push(`/${params.locale}/checkout?selectedAddressId=${created.id}` as Route);
        return;
      }
      setMessage("Address saved");
      setForm({ ...emptyForm, phone: localPhone });
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async (id: number) => {
    setError("");
    try {
      await apiDelete(`/api/v1/addresses/${id}`);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete address");
    }
  };

  return (
    <Container className="max-w-5xl">
      <PageHeader title="Addresses" subtitle="Manage where your orders get delivered." />

      {returnTo === "checkout" ? (
        <div className="mt-4">
          <Alert variant="warning">
            Add a new address below and it will be selected automatically when you return to checkout.
          </Alert>
        </div>
      ) : null}

      {message ? (
        <div className="mt-4">
          <Alert variant="success">{message}</Alert>
        </div>
      ) : null}
      {error ? (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          {addresses === null ? null : addresses.length === 0 ? (
            <EmptyState title="No saved addresses" description="Add your first delivery address." icon="📍" />
          ) : (
            addresses.map((item) => (
              <Card key={item.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.full_name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.house}, {item.street}, {item.area}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.city}, {item.state} - {item.pincode}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{item.phone}</p>
                  </div>
                  {item.is_default ? <Badge variant="brand">Default</Badge> : null}
                </div>
              
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="mt-3 text-sm font-medium text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </Card>
            ))
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card"
        >
          <h2 className="text-lg font-semibold text-slate-900">Add Address</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {fields.map(([key, label]) => (
              <div key={key} className={key === "full_name" || key === "landmark" ? "col-span-2" : undefined}>
                <Input
                  label={label}
                  value={form[key] as string}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                />
              </div>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <input
              checked={form.is_default}
              onChange={(event) => setForm((prev) => ({ ...prev, is_default: event.target.checked }))}
              type="checkbox"
              className="h-4 w-4 rounded border-brand-200"
            />
            Set as default address
          </label>
          <Button type="submit" className="mt-4" isLoading={isSubmitting}>
            Save Address
          </Button>
        </form>
      </div>
    </Container>
  );
}

export default function AddressesPage() {
  return (
    <RequireAuth>
      <AddressesContent />
    </RequireAuth>
  );
}
