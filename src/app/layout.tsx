import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wild Labs",
  description: "Eric Luttmann: 3D and AI products that open access to knowledge and creation.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#F3F3F1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
