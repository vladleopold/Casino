import type { CSSProperties } from "react";
import type { Metadata } from "next";

import { appConfig } from "@slotcity/config";
import { Providers } from "./providers";

import "./globals.css";

export const metadata: Metadata = {
  title: appConfig.appName,
  description: appConfig.tagline
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        style={
          {
            "--font-body": '"Trebuchet MS", "Segoe UI", sans-serif',
            "--font-display": '"Arial Black", "Trebuchet MS", sans-serif'
          } as CSSProperties
        }
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
