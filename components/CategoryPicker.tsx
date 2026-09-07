"use client";

import { cn } from "@/lib/utils";
import type { CategoryPreset } from "@/lib/types";

interface CategoryPickerProps {
  categories: CategoryPreset[];
  value: string;
  onChange: (id: string) => void;
}

export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-3 text-xs",
              active
                ? "border-accent bg-accent/10"
                : "border-white/10 bg-white/5 hover:bg-white/10",
            )}
          >
            <span className="text-2xl">{c.emoji}</span>
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
