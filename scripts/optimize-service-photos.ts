/**
 * One-shot script: convert Photo/*.jpeg into web-optimized assets at
 * public/services/{slug}-cover.{avif,webp}. Used for hero banners and OG images.
 *
 * Usage: pnpm tsx scripts/optimize-service-photos.ts
 */
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, parse } from "node:path";

import sharp from "sharp";

// Each photo's title text decides which slug it can serve. Filenames are
// matched case-insensitively (e.g. Grok.jpeg → grok).
const SLUG_BY_FILENAME: Record<string, string[]> = {
  gpt: ["chatgpt-pro"],
  gptplus: ["chatgpt-plus"],
  claude: ["claude-pro"],
  claude_max: ["claude-max"],
  cursor_pro: ["cursor-pro"],
  gemini: ["gemini-advanced"],
  grok: ["grok-premium"],
  perplexity: ["perplexity-pro"],
  replit: ["replit-core"],
  canva: ["canva-pro"],
  spotify: ["spotify-premium"],
  youtube: ["youtube-premium"],
};

const INPUT_DIR = "Photo";
const OUTPUT_DIR = join("public", "services");

async function optimize() {
  if (!existsSync(INPUT_DIR)) {
    console.error(`Input directory ${INPUT_DIR} not found`);
    process.exit(1);
  }
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = readdirSync(INPUT_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  let total = 0;

  for (const file of files) {
    const stem = parse(file).name.toLowerCase();
    const slugs = SLUG_BY_FILENAME[stem];
    if (!slugs) {
      console.warn(`! ${file} has no slug mapping, skipping`);
      continue;
    }

    const buffer = await sharp(join(INPUT_DIR, file))
      .resize({ width: 1600, withoutEnlargement: true })
      .toBuffer();

    for (const slug of slugs) {
      const webpPath = join(OUTPUT_DIR, `${slug}-cover.webp`);
      const avifPath = join(OUTPUT_DIR, `${slug}-cover.avif`);
      await sharp(buffer).webp({ quality: 82, effort: 5 }).toFile(webpPath);
      await sharp(buffer).avif({ quality: 60, effort: 5 }).toFile(avifPath);
      console.info(`OK ${slug}: webp + avif`);
      total += 2;
    }
  }

  console.info(`Done — ${total} files written to ${OUTPUT_DIR}`);
}

optimize().catch((err) => {
  console.error(err);
  process.exit(1);
});
