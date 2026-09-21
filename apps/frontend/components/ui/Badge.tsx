import { ReactNode } from "react";

type Variant = "brand" | "accent" | "success" | "warning" | "danger" | "neutral";

const variants: Record<Variant, string> = {
  brand: "bg-brand-100 text-brand-700",
  accent: "bg-accent-100 text-accent-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-700",
  neutral: "bg-slate-100 text-slate-700",
};

export function Badge({ variant = "neutral", children }: { variant?: Variant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}

const orderStatusVariant: Record<string, Variant> = {
  pending: "warning",
  confirmed: "brand",
  packed: "brand",
  out_for_delivery: "accent",
  delivered: "success",
  cancelled: "danger",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <Badge variant={orderStatusVariant[status] ?? "neutral"}>{status.replaceAll("_", " ")}</Badge>;
}
