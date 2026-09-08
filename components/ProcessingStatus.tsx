"use client";

import { useEffect } from "react";
import type { ProductJob } from "@/lib/types";

interface Props {
  job: ProductJob;
  onChange: (job: ProductJob) => void;
}

export function ProcessingStatus({ job, onChange }: Props) {
  useEffect(() => {
    if (job.status === "ready" || job.status === "failed") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${job.id}`);
      if (res.ok) {
        const { job: next } = await res.json();
        onChange(next);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [job.id, job.status, onChange]);

  if (job.status === "failed") {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm text-red-200">
          Error: {job.errorMessage || "Algo falló durante el procesamiento."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3 text-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        <span className="text-white">Generando video con AI</span>
      </div>
      <p className="mt-3 text-xs text-white/40">
        El video puede tardar entre 1 y 5 minutos.
      </p>
    </div>
  );
}
