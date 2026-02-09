import "server-only";

import { z } from "zod";

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().min(1),
  APP_BASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse({
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  APP_BASE_URL: process.env.APP_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  const errors = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${errors}`);
}

export const env = parsed.data;
