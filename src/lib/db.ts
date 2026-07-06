import { getCloudflareContext } from "@opennextjs/cloudflare";

type CloudflareD1Env = {
  DB: D1Database;
  SETUP_TOKEN?: string;
};

export async function getCloudflareEnv() {
  const { env } = await getCloudflareContext({ async: true });
  return env as CloudflareD1Env;
}

export async function getDb() {
  const env = await getCloudflareEnv();
  const db = (env as CloudflareD1Env).DB;

  if (!db) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }

  return db;
}
