import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Creator",
  description: "Edit photos and generate videos from product pictures with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
