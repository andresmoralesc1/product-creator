"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { ResultDisplay } from "@/components/ResultDisplay";
import { Button } from "@/components/ui/button";
import type { ProductJob } from "@/lib/types";

export default function ResultPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [job, setJob] = useState<ProductJob | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => setJob(d.job))
      .catch(() => null);
  }, [id]);

  async function startGenerate() {
    if (!job) return;
    setStarting(true);
    setStartError(null);
    const res = await fetch(`/api/jobs/${job.id}/generate`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      setStartError(data.error || "no se pudo iniciar la generación");
    } else {
      setJob((prev) =>
        prev
          ? {
              ...prev,
              status: "video_processing",
              marketingPhotoUrl: data.marketingPhotoUrl,
              minimaxVideoTaskId: data.videoTaskId,
            }
          : prev,
      );
    }
    setStarting(false);
  }

  if (!job) {
    return (
      <main className="py-20">
        <p className="font-mono text-micro uppercase tracking-kicker text-ink-dim cursor-blink">
          Cargando trabajo
        </p>
      </main>
    );
  }

  return (
    <main className="pb-32 pt-12 md:pt-20">
      <header className="mb-16 flex items-end justify-between border-b border-rule pb-6">
        <div>
          <p className="mb-2 font-mono text-micro uppercase tracking-kicker text-ink-dim">
            Trabajo · {job.id}
          </p>
          <h1 className="font-display text-display-lg text-ink md:text-[3.5rem]">
            {job.description}
          </h1>
        </div>
        <Link
          href="/"
          className="font-mono text-micro uppercase tracking-kicker text-ink-dim hover:text-accent"
        >
          ← Nuevo trabajo
        </Link>
      </header>

      {job.status === "pending" && (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_28rem]">
          <figure className="border-y border-rule py-6">
            <figcaption className="mb-4 flex items-baseline justify-between">
              <span className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
                Original · {job.id}
              </span>
              <span className="font-display text-lg italic text-ink">
                Pendiente
              </span>
            </figcaption>
            <Image
              src={job.originalPhotoUrl}
              alt="preview"
              width={800}
              height={600}
              unoptimized
              className="h-auto w-full"
            />
          </figure>

          <div className="space-y-6 lg:sticky lg:top-12 lg:self-start">
            <div>
              <p className="mb-3 font-mono text-micro uppercase tracking-kicker text-ink-dim">
                Pasos
              </p>
              <ol className="space-y-3">
                {[
                  ["01", "Editar foto · preserva producto"],
                  ["02", "Generar video · 5s · 768P"],
                  ["03", "Publicar"],
                ].map(([n, t]) => (
                  <li
                    key={n}
                    className="flex items-baseline gap-4 border-b border-rule pb-3"
                  >
                    <span className="font-mono text-micro uppercase tracking-kicker text-accent">
                      {n}
                    </span>
                    <span className="text-sm text-ink">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex justify-end">
              <Button onClick={startGenerate} disabled={starting}>
                {starting ? "Iniciando…" : "Generar contenido"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {(job.status === "editing_image" ||
        job.status === "video_processing") && (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_28rem]">
          <figure className="border-y border-rule py-6">
            <figcaption className="mb-4 flex items-baseline justify-between">
              <span className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
                {job.marketingPhotoUrl ? "Marketing · preview" : "Original"}
              </span>
              <span className="font-display text-lg italic text-ink">
                {job.status === "editing_image" ? "Editando" : "Video"}
              </span>
            </figcaption>
            <Image
              src={job.marketingPhotoUrl || job.originalPhotoUrl}
              alt="preview"
              width={800}
              height={600}
              unoptimized
              className={`h-auto w-full ${!job.marketingPhotoUrl ? "opacity-60" : ""}`}
            />
          </figure>
          <div className="lg:sticky lg:top-12 lg:self-start">
            <ProcessingStatus job={job} onChange={setJob} />
          </div>
        </div>
      )}

      {job.status === "ready" && <ResultDisplay job={job} />}

      {startError && (
        <div className="mt-8 border-l-2 border-accent bg-accent/10 px-4 py-3 text-sm text-ink">
          {startError}
        </div>
      )}
    </main>
  );
}
