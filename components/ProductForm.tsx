"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CategoryPicker } from "@/components/CategoryPicker";
import type { CategoryPreset } from "@/lib/types";

interface Props {
  categories: CategoryPreset[];
}

export function ProductForm({ categories }: Props) {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0].id);
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = categories.find((c) => c.id === category) || categories[0];
  const effectivePrompt = prompt.trim() ? prompt : selected.defaultPrompt;

  function handleFile(file: File | null | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photo) {
      setError("Sube una foto del producto");
      return;
    }
    if (description.trim().length < 3) {
      setError("La descripción es muy corta");
      return;
    }
    setSubmitting(true);
    setError(null);

    const form = new FormData();
    form.append("photo", photo);
    form.append("description", description);
    form.append("category", category);
    form.append("prompt", effectivePrompt);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload failed");

      router.push(`/results/${data.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "submission failed");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_28rem] lg:gap-16">
      <div>
        <label className="mb-3 block font-mono text-micro uppercase tracking-kicker text-ink-dim">
          Original
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex aspect-[4/3] cursor-pointer items-center justify-center border-2 border-dashed transition ${
            dragging
              ? "border-accent bg-accent/5"
              : preview
              ? "border-rule"
              : "border-rule hover:border-ink-muted"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="sr-only"
          />
          {preview ? (
            <>
              <Image
                src={preview}
                alt="preview"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-rule bg-bg/80 px-3 py-2 font-mono text-micro uppercase tracking-kicker text-ink-dim backdrop-blur-sm">
                <span>{photo?.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhoto(null);
                    setPreview(null);
                  }}
                  className="text-ink-muted hover:text-accent"
                >
                  Quitar
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
                Drop · Click · Browse
              </span>
              <span className="font-display text-xl italic text-ink-muted">
                Suelta la foto aquí
              </span>
              <span className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
                JPG · PNG · WEBP
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <label className="mb-3 block font-mono text-micro uppercase tracking-kicker text-ink-dim">
            Categoría
          </label>
          <CategoryPicker
            categories={categories}
            value={category}
            onChange={(id) => setCategory(id as typeof category)}
          />
        </div>

        <div>
          <label className="mb-3 block font-mono text-micro uppercase tracking-kicker text-ink-dim">
            Descripción
          </label>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tenis running rojos, suela de espuma, AndesWear"
            showCount
            maxLength={500}
          />
        </div>

        <details className="group">
          <summary className="cursor-pointer list-none font-mono text-micro uppercase tracking-kicker text-ink-dim hover:text-ink">
            Prompt personalizado <span className="text-ink-dim group-open:hidden">+</span><span className="hidden text-ink-dim group-open:inline">−</span>
          </summary>
          <div className="mt-3">
            <Textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={selected.defaultPrompt}
              showCount
              maxLength={2000}
            />
            <p className="mt-2 font-mono text-micro uppercase tracking-kicker text-ink-dim">
              Vacío = prompt por categoría
            </p>
          </div>
        </details>

        {error && (
          <div className="border-l-2 border-accent bg-accent/10 px-4 py-3 text-sm text-ink">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-rule pt-6">
          <span className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
            {photo ? "Listo" : "Falta foto"}
          </span>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Procesando…" : "Crear trabajo"}
          </Button>
        </div>
      </div>
    </form>
  );
}
