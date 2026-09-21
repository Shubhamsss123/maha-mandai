"use client";

import { FormEvent, use, useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { Alert } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { apiPost } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { Locale } from "@/lib/i18n/config";

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  is_new_user: boolean;
};

export default function LoginPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await apiPost<TokenResponse>("/api/v1/auth/login", { mobile_number: mobile });
      await setSession(data);
      const next = searchParams.get("next");
      router.push((next || `/${resolvedParams.locale}`) as Route);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-14">
      <div className="mb-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 text-2xl text-white mx-auto">
          🔐
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Login to continue</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your mobile number to continue.</p>
      </div>

      <Card>
        {error ? (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Mobile Number"
            placeholder="10-digit mobile number"
            inputMode="numeric"
            maxLength={10}
            value={mobile}
            onChange={(event) => setMobile(event.target.value.replace(/\D/g, ""))}
          />
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Continue
          </Button>
        </form>
      </Card>
    </section>
  );
}
