"use client";

import { useEffect } from "react";
import type { ProductJob } from "@/lib/types";

interface Props {
  job: ProductJob;
  onChange: (job: ProductJob) => void;
}

const STEPS: { id: ProductJob["status"]; label: string; mono: string }[] = [
  { id: "editing_image", label: "Editando foto", mono: "GEMINI · FLASH IMAGE" },
  { id: "video_processing", label: "Generando video", mono: "MINIMAX · H3 · 768P" },
  { id: "ready", label: "Listo", mono: "WEBHOOK · OK" },
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
      <div className="border border-accent bg-accent/5 p-6">
        <p className="font-mono text-micro uppercase tracking-kicker text-accent">
          Error
        </p>
        <p className="mt-2 text-sm text-ink">
          {job.errorMessage || "Algo falló durante el procesamiento."}
        </p>
      </div>
    );
  }

  const activeIdx = STEPS.findIndex((s) => s.id === job.status);
  const done = job.status === "ready";

  return (
    <div className="border-y border-rule py-8">
      <p className="mb-6 font-mono text-micro uppercase tracking-kicker text-ink-dim">
        Progreso
      </p>
      <ol className="space-y-6">
        {STEPS.map((s, i) => {
          const stepDone = done || i < activeIdx;
          const stepActive = !done && i === activeIdx;
          return (
            <li key={s.id} className="relative pl-8">
              <span
                className={`absolute left-0 top-2 inline-block h-2 w-2 ${
                  stepDone
                    ? "bg-accent"
                    : stepActive
                    ? "bg-accent animate-pulse"
                    : "bg-rule"
                }`}
              />
              {!stepDone && i < STEPS.length - 1 && (
                <span className="absolute left-[3px] top-4 h-[calc(100%+1.25rem)] w-px bg-rule" />
              )}
              <div className="flex items-baseline justify-between gap-4">
                <span
                  className={
                    stepDone || stepActive
                      ? "text-ink"
                      : "text-ink-dim"
                  }
                >
                  {s.label}
                </span>
                <span className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
                  {stepDone ? "OK" : stepActive ? "RUN_" : "WAIT"}
                </span>
              </div>
              <p className="mt-1 font-mono text-micro uppercase tracking-kicker text-ink-dim">
                {s.mono}
              </p>
            </li>
          );
        })}
      </ol>
      {job.status === "video_processing" && (
        <p className="mt-6 font-mono text-micro uppercase tracking-kicker text-ink-dim cursor-blink">
          Generando video · 1-5 min
        </p>
      )}
    </div>
  );
}
