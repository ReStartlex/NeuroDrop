import { logger } from "@/lib/logger";

async function seed(): Promise<void> {
  logger.info("seed: nothing to seed yet — coming in Phase 1");
}

await seed();
process.exit(0);
