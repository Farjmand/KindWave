import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KindWave — Positive messages from strangers around the world",
  description: "Share a kind word with the world, no login required. Real-time positive messages from every corner of the globe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
