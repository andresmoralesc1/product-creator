import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { ProductForm } from "@/components/ProductForm";

export default function HomePage() {
  return (
    <main className="pb-32 pt-12 md:pt-20">
      <section className="border-b border-rule pb-20 md:pb-28">
        <p className="mb-6 font-mono text-micro uppercase tracking-kicker text-ink-dim">
          01 — Estudio
        </p>
        <h1 className="font-display text-display-lg text-ink md:text-display-xl">
          Tu producto,{" "}
          <span className="italic text-accent">en tres formatos.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted">
          Subes una foto. Editamos el escenario preservando el producto.
          Generamos un video de 5&nbsp;segundos. Lo publicas en Instagram,
          TikTok y Facebook con un click.
        </p>
        <dl className="mt-12 grid grid-cols-1 gap-px border border-rule bg-rule sm:grid-cols-3">
          {[
            ["Foto editada", "Gemini 2.5 Flash · preserva el sujeto"],
            ["Video 5s", "MiniMax H3 · primer frame = tu producto"],
            ["Publicar", "Instagram · TikTok · Facebook"],
          ].map(([k, v]) => (
            <div key={k} className="bg-bg p-5">
              <dt className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
                {k}
              </dt>
              <dd className="mt-2 text-sm text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pt-20 md:pt-28">
        <div className="mb-12 flex items-baseline justify-between">
          <h2 className="font-display text-h-md text-ink md:text-display-lg">
            Empezar un trabajo
          </h2>
          <Link
            href="/"
            className="font-mono text-micro uppercase tracking-kicker text-ink-dim hover:text-ink"
          >
            02 — Formulario
          </Link>
        </div>
        <ProductForm categories={CATEGORIES} />
      </section>
    </main>
  );
}
