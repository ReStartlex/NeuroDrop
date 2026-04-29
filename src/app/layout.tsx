import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

import { AppToaster } from "@/components/theme/app-toaster";
import { ThemeScript } from "@/components/theme/theme-script";

import type { Metadata, Viewport } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "NeuroDrop — зарубежные подписки в рублях",
    template: "%s · NeuroDrop",
  },
  description:
    "ChatGPT, Cursor, Claude, Gemini, Perplexity, Spotify, YouTube Premium и другие зарубежные подписки. Оплата картой РФ или СБП, быстрая выдача, поддержка 24/7.",
  keywords: [
    "ChatGPT",
    "Cursor Pro",
    "Claude Pro",
    "Gemini",
    "Perplexity",
    "Spotify",
    "YouTube Premium",
    "купить подписку",
    "оплата картой РФ",
  ],
  applicationName: "NeuroDrop",
  authors: [{ name: "NeuroDrop" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "NeuroDrop",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070710" },
    { media: "(prefers-color-scheme: light)", color: "#fafbfd" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="font-sans antialiased">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
