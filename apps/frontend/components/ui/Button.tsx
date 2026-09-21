import type { Route } from "next";
import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "accent" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft",
  accent: "bg-accent text-white hover:bg-accent-600 shadow-soft",
  outline: "border border-brand-200 bg-white text-brand-700 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  className?: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", isLoading, fullWidth, children, className = "" } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href as Route} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, isLoading: _isLoading, fullWidth: _fullWidth, children: _children, ...buttonProps } =
    props as ButtonAsButton;
  return (
    <button
      {...buttonProps}
      className={classes}
      disabled={buttonProps.disabled || isLoading}
    >
      {isLoading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
