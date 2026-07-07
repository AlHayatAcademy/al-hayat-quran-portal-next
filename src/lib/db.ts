import { getCloudflareContext } from "@opennextjs/cloudflare";
import { assertEnv, CloudflareD1Env, validateEnv } from "@/lib/env";
import { logger } from "@/lib/utils/logger";

export async function getCloudflareEnv() {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Partial<CloudflareD1Env>;
  const validation = validateEnv(cloudflareEnv);

  if (validation.warnings.length) {
    logger.debug("Environment validation warnings", { warnings: validation.warnings });
  }

  return cloudflareEnv as CloudflareD1Env;
}

export async function getDb() {
  const env = await getCloudflareEnv();
  assertEnv(env);
  return env.DB;
}
