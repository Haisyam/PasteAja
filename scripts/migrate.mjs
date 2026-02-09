import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@libsql/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const migrationsDir = path.join(projectRoot, "migrations");

async function loadEnvFile(filename) {
  const filePath = path.join(projectRoot, filename);

  try {
    const raw = await fs.readFile(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Env file is optional.
  }
}

function splitStatements(sql) {
  return sql
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

function isIgnorableMigrationError(error) {
  const message = String(error?.message ?? "").toLowerCase();
  return (
    message.includes("duplicate column name") ||
    message.includes("already exists")
  );
}

await loadEnvFile(".env.local");
await loadEnvFile(".env");

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error(
    "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required (set in .env.local/.env or shell env)",
  );
}

const client = createClient({ url, authToken });
const entries = await fs.readdir(migrationsDir);
const migrationFiles = entries.filter((name) => name.endsWith(".sql")).sort();

for (const file of migrationFiles) {
  const filePath = path.join(migrationsDir, file);
  const sql = await fs.readFile(filePath, "utf8");

  for (const statement of splitStatements(sql)) {
    try {
      await client.execute(statement);
    } catch (error) {
      if (isIgnorableMigrationError(error)) {
        console.log(`Skipping already-applied statement in ${file}`);
        continue;
      }
      throw error;
    }
  }

  console.log(`Applied: ${file}`);
}

console.log("Migration completed successfully.");
