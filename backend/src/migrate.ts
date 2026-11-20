import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { seedDocumentTypes } from "./db/seed-document-types.js";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log("⏳ Running migrations...");

  const start = Date.now();
  // Ensure the path matches the 'out' folder in your drizzle.config.ts
  await migrate(db, { migrationsFolder: "./drizzle" });
  await seedDocumentTypes(databaseUrl);

  const end = Date.now();

  console.log(
    `✅ Migrations and document catalog seeding completed in ${end - start}ms`,
  );
}

main().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
