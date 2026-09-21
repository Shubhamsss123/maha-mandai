import { ReactNode } from "react";

export function Alert({
  variant = "error",
  children,
}: {
  variant?: "error" | "success" | "warning";
  children: ReactNode;
}) {
  const styles =
    variant === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : variant === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return <div className={`rounded-lg border px-4 py-2.5 text-sm ${styles}`}>{children}</div>;
}

export function EmptyState({
  title,
  description,
  action,
  icon = "🛒",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white/60 px-6 py-14 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="mt-3 text-base font-semibold text-slate-800">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-brand-100" />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-brand-50" />
        ))}
      </div>
    </div>
  );
}
