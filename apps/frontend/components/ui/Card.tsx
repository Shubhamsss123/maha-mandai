import { ButtonHTMLAttributes, HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-brand-100 bg-white p-5 shadow-card ${className}`}
      {...rest}
    />
  );
}

export function SelectableCard({
  selected,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      className={`w-full rounded-2xl border p-4 text-left shadow-card transition ${
        selected
          ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500"
          : "border-brand-100 bg-white hover:border-brand-300"
      } ${className}`}
      {...rest}
    />
  );
}
