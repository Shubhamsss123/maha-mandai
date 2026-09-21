import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type WrapperProps = {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

function FieldWrapper({ label, error, hint, children }: WrapperProps) {
  return (
    <label className="block text-sm">
      {label ? <span className="mb-1 block font-medium text-slate-700">{label}</span> : null}
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function Input({
  label,
  error,
  hint,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string }) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <input
        className={`${inputBase} ${error ? "border-rose-300" : "border-brand-100"} ${className}`}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; hint?: string }) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <textarea
        className={`${inputBase} min-h-[88px] ${error ? "border-rose-300" : "border-brand-100"} ${className}`}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function Select({
  label,
  error,
  hint,
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; hint?: string }) {
  return (
    <FieldWrapper label={label} error={error} hint={hint}>
      <select
        className={`${inputBase} ${error ? "border-rose-300" : "border-brand-100"} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
