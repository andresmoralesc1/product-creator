import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Product Creator — darkroom",
  description:
    "Sube una foto de tu producto y obtén una versión editada + video listos para redes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        <div className="mx-auto max-w-[72rem] px-5 md:px-8">
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="flex items-baseline justify-between border-b border-rule py-6">
      <Link
        href="/"
        className="font-display text-2xl italic tracking-tighter text-ink"
      >
        Product Creator
      </Link>
      <span className="font-mono text-micro uppercase tracking-kicker text-ink-dim">
        Darkroom · v0.1
      </span>
    </header>
  );
}
