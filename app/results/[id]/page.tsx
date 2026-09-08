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
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-white/60">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Trabajo {job.id}</h1>
          <p className="mt-1 text-sm text-white/60">{job.description}</p>
        </div>
        <Link href="/" className="text-sm text-accent underline">
          Nuevo producto
        </Link>
      </header>

      {job.status === "pending" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <Image
              src={job.originalPhotoUrl}
              alt="preview"
              width={768}
              height={384}
              unoptimized
              className="mx-auto max-h-96 rounded object-contain"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={startGenerate} disabled={starting}>
              {starting ? "Iniciando..." : "Generar contenido AI"}
            </Button>
          </div>
        </div>
      )}

      {(job.status === "generating_image" ||
        job.status === "video_processing" ||
        job.status === "ready") && (
        <div className="space-y-6">
          {job.status !== "ready" && (
            <ProcessingStatus job={job} onChange={setJob} />
          )}

          {job.status === "ready" ? (
            <ResultDisplay job={job} />
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              {job.marketingPhotoUrl ? (
                <Image
                  src={job.marketingPhotoUrl}
                  alt="preview"
                  width={768}
                  height={384}
                  unoptimized
                  className="mx-auto max-h-96 rounded object-contain"
                />
              ) : job.originalPhotoUrl ? (
                <Image
                  src={job.originalPhotoUrl}
                  alt="preview"
                  width={768}
                  height={384}
                  unoptimized
                  className="mx-auto max-h-96 rounded object-contain opacity-60"
                />
              ) : null}
            </div>
          )}
        </div>
      )}

      {startError && (
        <div className="mt-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {startError}
        </div>
      )}
    </main>
  );
}
