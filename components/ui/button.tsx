"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center px-5 py-3 font-mono text-caption uppercase tracking-caption transition disabled:cursor-not-allowed disabled:opacity-40";
    const variants: Record<Variant, string> = {
      primary:
        "bg-accent text-accent-ink hover:-translate-y-px hover:shadow-accent-lift",
      ghost:
        "border border-rule bg-transparent text-ink hover:bg-surface-2",
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
