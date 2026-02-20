/**
 * Run a SQL migration file against the Supabase database.
 * Usage: node scripts/run-migration.mjs scripts/003-projects-and-posts.sql
 */
import pg from "pg";
import fs from "fs";
import path from "path";

// Manual .env.local loader (no dotenv dependency needed)
function loadEnv(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* file not found — skip */
  }
}

loadEnv(".env.local");
loadEnv(".env");

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("SUPABASE_DB_URL not set in .env.local");
  process.exit(1);
}

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: node scripts/run-migration.mjs <path-to-sql>");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl });
const client = await pool.connect();

try {
  const sql = fs.readFileSync(path.resolve(sqlFile), "utf8");
  console.log(`Running migration: ${sqlFile} ...`);
  await client.query(sql);
  console.log("✅ Migration completed successfully!");

  // Verify tables
  const { rows: tables } = await client.query(
    `SELECT tablename FROM pg_tables WHERE tablename IN ('projects', 'posts') ORDER BY tablename`,
  );
  console.log("Tables:", tables.map((r) => r.tablename).join(", "));

  // Verify indexes
  const { rows: indexes } = await client.query(
    `SELECT indexname FROM pg_indexes WHERE tablename IN ('projects', 'posts') ORDER BY indexname`,
  );
  console.log("Indexes:", indexes.map((r) => r.indexname).join(", "));

  // Verify RLS
  const { rows: rls } = await client.query(
    `SELECT tablename, policyname FROM pg_policies WHERE tablename IN ('projects', 'posts') ORDER BY tablename, policyname`,
  );
  console.log(
    "RLS policies:",
    rls.map((r) => `${r.tablename}.${r.policyname}`).join(", "),
  );
} catch (err) {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
