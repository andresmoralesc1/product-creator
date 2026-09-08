"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProductJob } from "@/lib/types";

interface Props {
  job: ProductJob;
}

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
] as const;

function StudioFrame({
  label,
  mono,
  children,
  download,
}: {
  label: string;
  mono: string;
  children: React.ReactNode;
  download?: { href: string; name: string };
}) {
  return (
    <figure className="group border-y border-rule py-6">
      <figcaption className="mb-4 flex items-baseline justify-between">
        <span className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
          {mono}
        </span>
        <span className="font-display text-lg italic text-ink">{label}</span>
      </figcaption>
      <div className="relative">{children}</div>
      {download && (
        <a
          href={download.href}
          download={download.name}
          className="mt-4 inline-block font-mono text-micro uppercase tracking-kicker text-ink-dim hover:text-accent"
        >
          ↓ Descargar
        </a>
      )}
    </figure>
  );
}

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
    <div className="animate-studio-up">
      <p className="mb-12 font-mono text-micro uppercase tracking-kicker text-accent">
        Resultado · listo para publicar
      </p>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <StudioFrame
          label="Original"
          mono={`Original · ${job.id}`}
          download={{ href: job.originalPhotoUrl, name: `original-${job.id}` }}
        >
          <Image
            src={job.originalPhotoUrl}
            alt="original"
            width={800}
            height={800}
            unoptimized
            className="h-auto w-full"
          />
        </StudioFrame>

        {job.marketingPhotoUrl && (
          <StudioFrame
            label="Marketing"
            mono="Gemini · 2.5 Flash Image"
            download={{
              href: job.marketingPhotoUrl,
              name: `marketing-${job.id}`,
            }}
          >
            <Image
              src={job.marketingPhotoUrl}
              alt="marketing"
              width={800}
              height={800}
              unoptimized
              className="h-auto w-full"
            />
          </StudioFrame>
        )}
      </div>

      {job.videoUrl && (
        <StudioFrame
          label="Video"
          mono={`MiniMax · H3 · 768P · 5s`}
          download={{ href: job.videoUrl, name: `video-${job.id}` }}
        >
          <video
            src={job.videoUrl}
            controls
            className="aspect-video w-full bg-bg"
          />
        </StudioFrame>
      )}

      <section className="mt-16 border-t border-rule pt-12">
        <p className="mb-3 font-mono text-micro uppercase tracking-kicker text-ink-dim">
          Publicar
        </p>
        <h2 className="font-display text-h-md text-ink md:text-display-lg">
          Caption + destinos
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[28rem_1fr]">
          <Textarea
            rows={5}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            showCount
            maxLength={2200}
            placeholder="Caption para tus posts"
          />

          <div className="space-y-4">
            <p className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
              Destinos
            </p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const active = selected.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      "inline-flex items-center gap-2 border px-4 py-2 font-mono text-caption uppercase tracking-caption transition",
                      active
                        ? "border-accent text-ink"
                        : "border-rule text-ink-muted hover:border-ink-muted hover:text-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "text-base",
                        active ? "text-accent" : "text-ink-dim",
                      )}
                      aria-hidden
                    >
                      ●
                    </span>
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-rule pt-6">
              <span className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
                {selected.size} destinos
              </span>
              <Button onClick={publish} disabled={posting || selected.size === 0}>
                {posting ? "Publicando…" : "Publicar"}
              </Button>
            </div>

            {Object.keys(results).length > 0 && (
              <ul className="space-y-1 border-l-2 border-accent pl-4">
                {Object.entries(results).map(([p, id]) => (
                  <li key={p} className="font-mono text-micro uppercase tracking-kicker text-ink">
                    {p} · OK · {id}
                  </li>
                ))}
              </ul>
            )}
            {Object.keys(errors).length > 0 && (
              <ul className="space-y-1 border-l-2 border-accent pl-4">
                {Object.entries(errors).map(([p, msg]) => (
                  <li key={p} className="font-mono text-micro uppercase tracking-kicker text-ink-muted">
                    {p} · {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
