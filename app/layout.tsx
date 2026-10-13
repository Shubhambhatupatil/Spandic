import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPANDIC — Your world, in your feed",
  description: "Discover people, stories and ideas from around the world on SPANDIC.",
  applicationName: "SPANDIC",
  openGraph: {
    title: "SPANDIC",
    description: "Your world, in your feed.",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101010"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
