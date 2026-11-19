import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Little Christmas World | Merry Christmas",
  description:
    "Step into a little Christmas world filled with winter magic, warm wishes, surprises and festive joy.",
  applicationName: "A Little Christmas World"
};

export const viewport: Viewport = {
  themeColor: "#0b211d",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
