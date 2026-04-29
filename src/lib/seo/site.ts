export const SITE = {
  name: "NeuroDrop",
  description:
    "Зарубежные подписки в рублях: ChatGPT, Cursor, Claude, Gemini, Perplexity, Spotify, YouTube Premium и другие. Оплата картой РФ или СБП, выдача за минуты, гарантия замены.",
  locale: "ru_RU",
  language: "ru-RU",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  telegram: "https://t.me/neurodrop",
  email: "hello@neurodrop.ru",
  authorName: "NeuroDrop",
} as const;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = SITE.url.replace(/\/$/, "");
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}
