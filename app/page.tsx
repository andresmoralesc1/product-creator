import { CATEGORIES } from "@/lib/categories";
import { ProductForm } from "@/components/ProductForm";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Product Creator
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Sube una foto de tu producto, elige categoría, y generamos una versión
          editada con AI + un video listo para redes.
        </p>
      </header>

      <ProductForm categories={CATEGORIES} />
    </main>
  );
}
