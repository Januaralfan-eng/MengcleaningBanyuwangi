import { list, put } from "@vercel/blob";
import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_PATH = "cleanapp/public-content.json";
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const APPLY = process.argv.includes("--apply");

if (!TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN not set");
  process.exit(1);
}

function hashPassword(plain) {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const { blobs } = await list({ prefix: CONTENT_PATH, limit: 5 });
const blob = blobs.find((b) => b.pathname === CONTENT_PATH);
if (!blob) {
  console.error("Blob not found");
  process.exit(1);
}

console.log("Blob URL:", blob.url);
console.log("Size:", blob.size, "bytes");
console.log("Uploaded:", blob.uploadedAt);

const response = await fetch(blob.url, {
  cache: "no-store",
  headers: { authorization: `Bearer ${TOKEN}` }
});
if (!response.ok) {
  console.error("Fetch failed:", response.status);
  process.exit(1);
}
const raw = await response.text();

const backupPath = path.join(process.cwd(), `backup-public-content-${Date.now()}.json`);
await fs.writeFile(backupPath, raw, "utf-8");
console.log(`Backup written: ${backupPath} (${raw.length} bytes)`);

const data = JSON.parse(raw);
console.log("\nAll top-level keys preserved:", Object.keys(data).join(", "));
console.log("adminAccounts entries:", (data.adminAccounts || []).length);

const updated = (data.adminAccounts || []).map((acct) => {
  const username = String(acct.username || "");
  const password = String(acct.password || "");
  const alreadyHashed = password.startsWith("scrypt$");
  if (!password) {
    console.log(`  - id=${acct.id} username=${username} → no password (skip)`);
    return acct;
  }
  if (alreadyHashed) {
    console.log(`  - id=${acct.id} username=${username} → already scrypt (skip)`);
    return acct;
  }
  if (APPLY) {
    const hashed = hashPassword(password);
    console.log(`  - id=${acct.id} username=${username} → will hash (apply)`);
    return { ...acct, password: hashed };
  } else {
    console.log(`  - id=${acct.id} username=${username} → would hash plaintext "${password.slice(0, 3)}***" (dry-run)`);
    return acct;
  }
});

if (!APPLY) {
  console.log("\nDry-run only. Run again with --apply to write back.");
  process.exit(0);
}

const next = { ...data, adminAccounts: updated };
const newJson = JSON.stringify(next);

await put(CONTENT_PATH, newJson, {
  access: "private",
  allowOverwrite: true,
  addRandomSuffix: false,
  cacheControlMaxAge: 60,
  contentType: "application/json"
});

console.log(`\nApplied. New blob size: ${newJson.length} bytes.`);
console.log("Re-verify: GET /api/public-content (admin password should now be scrypt-hashed).");
