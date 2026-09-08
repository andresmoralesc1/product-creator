"use client";

import { cn } from "@/lib/utils";
import type { CategoryPreset } from "@/lib/types";

interface CategoryPickerProps {
  categories: CategoryPreset[];
  value: string;
  onChange: (id: string) => void;
}

export function CategoryPicker({
  categories,
  value,
  onChange,
}: CategoryPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={cn(
              "inline-flex items-center gap-2 border px-3 py-2 font-mono text-caption uppercase tracking-caption transition",
              active
                ? "border-accent text-ink"
                : "border-rule text-ink-muted hover:border-ink-muted hover:text-ink",
            )}
          >
            <span
              className={cn(
                "text-base leading-none",
                active ? "text-accent" : "text-ink-dim",
              )}
              aria-hidden
            >
              {c.emoji}
            </span>
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
