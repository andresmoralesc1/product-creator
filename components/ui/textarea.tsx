"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCount, maxLength, value, ...props }, ref) => {
    const length = typeof value === "string" ? value.length : 0;
    const [focused, setFocused] = useState(false);

    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "w-full resize-none border border-rule bg-transparent px-3 py-3 text-base text-ink placeholder:text-ink-dim focus:border-accent focus:outline-none",
            className,
          )}
          {...props}
        />
        {showCount && (
          <span
            className={cn(
              "pointer-events-none absolute bottom-2 right-3 font-mono text-micro uppercase tracking-kicker transition-colors",
              focused ? "text-accent" : "text-ink-dim",
            )}
          >
            {length}
            {maxLength ? `/${maxLength}` : ""}
          </span>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
