/**
 * Create the post-thumbnails storage bucket in Supabase.
 * Usage: node scripts/create-bucket.mjs
 */
import fs from "fs";

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
    /* file not found */
  }
}

loadEnv(".env.local");
loadEnv(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const res = await fetch(`${url}/storage/v1/bucket`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    apikey: serviceKey,
  },
  body: JSON.stringify({
    id: "post-thumbnails",
    name: "post-thumbnails",
    public: true,
    file_size_limit: 5242880,
    allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
  }),
});

const data = await res.json();
if (res.ok) {
  console.log(
    "✅ Storage bucket 'post-thumbnails' created:",
    JSON.stringify(data),
  );
} else if (data?.message?.includes("already exists")) {
  console.log(
    "⚠️  Bucket 'post-thumbnails' already exists — no action needed.",
  );
} else {
  console.error("❌ Failed to create bucket:", JSON.stringify(data));
  process.exit(1);
}
