import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ДекорПрестиж — входные двери «Лабиринт»",
  description: "Входные двери, панели, подбор комплектации и консультация специалиста.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
