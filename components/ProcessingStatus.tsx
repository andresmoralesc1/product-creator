"use client";

import { useEffect } from "react";
import type { ProductJob } from "@/lib/types";

interface Props {
  job: ProductJob;
  onChange: (job: ProductJob) => void;
}

const STEPS = [
  { id: "generating_image", label: "Generando imagen de marketing" },
  { id: "video_processing", label: "Generando video" },
  { id: "ready", label: "Listo" },
];

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

  const activeIdx = STEPS.findIndex((s) => s.id === job.status);
  const done = job.status === "ready";

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <ol className="flex flex-col gap-3">
        {STEPS.map((s, i) => {
          const stepDone = done || i < activeIdx;
          const stepActive = !done && i === activeIdx;
          return (
            <li key={s.id} className="flex items-center gap-3 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  stepDone
                    ? "bg-green-400"
                    : stepActive
                    ? "bg-accent animate-pulse"
                    : "bg-white/20"
                }`}
              />
              <span
                className={
                  stepDone || stepActive ? "text-white" : "text-white/40"
                }
              >
                {s.label}
              </span>
              {stepActive && !stepDone && (
                <span className="text-xs text-white/40">en curso...</span>
              )}
            </li>
          );
        })}
      </ol>

      {job.status === "video_processing" && (
        <div className="mt-4 flex justify-end">
          <p className="text-xs text-white/40">
            El video puede tardar entre 1 y 5 minutos.
          </p>
        </div>
      )}
    </div>
  );
}
