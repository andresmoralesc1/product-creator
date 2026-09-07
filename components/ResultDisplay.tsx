"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProductJob } from "@/lib/types";
import type { SocialPostResult } from "@/lib/types";

interface Props {
  job: ProductJob;
}

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
] as const;

export function ResultDisplay({ job }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [caption, setCaption] = useState(
    `${job.description} #producto #${job.category}`,
  );
  const [posting, setPosting] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function togglePlatform(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function publish() {
    if (selected.size === 0) return;
    setPosting(true);
    setResults({});
    setErrors({});
    const res = await fetch("/api/social/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId: job.id,
        platforms: Array.from(selected),
        caption,
      }),
    });
    const data = await res.json();
    setResults(data.results || {});
    setErrors(data.errors || {});
    setPosting(false);
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
            Foto original
          </p>
          <Image
            src={job.originalPhotoUrl}
            alt="original"
            width={800}
            height={800}
            unoptimized
            className="h-auto w-full rounded object-contain"
          />
          <a
            href={job.originalPhotoUrl}
            download
            className="mt-2 inline-block text-xs text-accent underline"
          >
            Descargar
          </a>
        </div>
        {job.editedPhotoUrl && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
              Foto editada con AI
            </p>
            <Image
              src={job.editedPhotoUrl}
              alt="edited"
              width={800}
              height={800}
              unoptimized
              className="h-auto w-full rounded object-contain"
            />
            <a
              href={job.editedPhotoUrl}
              download
              className="mt-2 inline-block text-xs text-accent underline"
            >
              Descargar
            </a>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {job.videoUrl && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
              Video generado
            </p>
            <video
              src={job.videoUrl}
              controls
              className="w-full rounded"
            />
            <a
              href={job.videoUrl}
              download
              className="mt-2 inline-block text-xs text-accent underline"
            >
              Descargar video
            </a>
          </div>
        )}

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-sm font-medium">Publicar en redes</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const active = selected.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    active
                      ? "border-accent bg-accent/10 text-white"
                      : "border-white/10 bg-white/5 text-white/60",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <Textarea
            rows={3}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption..."
          />
          <div className="mt-3 flex justify-end">
            <Button
              onClick={publish}
              disabled={posting || selected.size === 0}
            >
              {posting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
          {Object.keys(results).length > 0 && (
            <div className="mt-3 space-y-1 text-xs">
              {Object.entries(results).map(([p, id]) => (
                <p key={p} className="text-green-300">
                  {p}: publicado ({id})
                </p>
              ))}
            </div>
          )}
          {Object.keys(errors).length > 0 && (
            <div className="mt-3 space-y-1 text-xs">
              {Object.entries(errors).map(([p, msg]) => (
                <p key={p} className="text-red-300">
                  {p}: {msg}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
