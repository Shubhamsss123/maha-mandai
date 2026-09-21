import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function Container({ className = "max-w-6xl", children }: { className?: string; children: ReactNode }) {
  return <section className={`mx-auto px-4 py-10 ${className}`}>{children}</section>;
}
