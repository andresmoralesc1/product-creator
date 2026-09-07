"use client";

import { useState } from "react";
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

  const selected = categories.find((c) => c.id === category) || categories[0];
  const effectivePrompt = prompt.trim() ? prompt : selected.defaultPrompt;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Foto del producto</label>
          <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="cursor-pointer"
            />
            {preview && (
              <Image
                src={preview}
                alt="preview"
                width={512}
                height={256}
                unoptimized
                className="mt-4 max-h-64 w-full rounded object-contain"
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Categoría</label>
            <CategoryPicker
              categories={categories}
              value={category}
              onChange={(id) => setCategory(id as typeof category)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Descripción</label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Tenis running rojos, suela de espuma, marca AndesWear"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Prompt para edición (opcional)
            </label>
            <Textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={selected.defaultPrompt}
            />
            <p className="mt-1 text-xs text-white/50">
              Si lo dejas vacío usamos el default de la categoría.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Procesando..." : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
