import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";

import "./globals.css";

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
  themeColor: "#070710",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
