import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "dist", "public");
const BUILD_DIR = path.join(ROOT, ".snapshot-build");
const ORIGIN = (process.env.SNAPSHOT_SOURCE_ORIGIN || "https://mengcleaning-banyuwangi.vercel.app").replace(/\/$/, "");

const assetPattern = /(?:["'`(=]\s*)(\/?assets\/[^"'`()<>\s?#]+(?:\?[^"'`()<>\s#]+)?)/g;
const textAssetPattern = /\.(?:html|js|css|json|svg|txt|map)(?:\?|$)/i;

async function fetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Gagal mengambil ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function fetchBuffer(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Gagal mengambil ${url}: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function collectAssets(text, queue, seen) {
  for (const match of text.matchAll(assetPattern)) {
    const cleanPath = `/${match[1].replace(/^\/+/, "").replace(/&amp;/g, "&")}`;
    if (!seen.has(cleanPath)) queue.push(cleanPath);
  }
}

async function writeFileFromUrl(targetDir, assetPath, bytes) {
  const cleanPath = assetPath.split("?")[0].replace(/^\/+/, "");
  const target = path.join(targetDir, cleanPath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
}

async function buildSnapshot(targetDir) {
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });

  console.log(`Menyalin frontend live dari ${ORIGIN}`);
  const html = await fetchText(`${ORIGIN}/`);
  await fs.writeFile(path.join(targetDir, "index.html"), html, "utf-8");

  const queue = [];
  const seen = new Set();
  collectAssets(html, queue, seen);

  while (queue.length) {
    const assetPath = queue.shift();
    if (seen.has(assetPath)) continue;
    seen.add(assetPath);

    const bytes = await fetchBuffer(`${ORIGIN}${assetPath}`);
    await writeFileFromUrl(targetDir, assetPath, bytes);

    if (textAssetPattern.test(assetPath)) {
      collectAssets(bytes.toString("utf-8"), queue, seen);
    }
  }

  console.log(`Frontend snapshot selesai: ${seen.size} aset disalin.`);
}

try {
  await buildSnapshot(BUILD_DIR);
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.rename(BUILD_DIR, OUT_DIR);
} catch (error) {
  await fs.rm(BUILD_DIR, { recursive: true, force: true });
  try {
    await fs.access(path.join(OUT_DIR, "index.html"));
    console.warn(`Snapshot live gagal, memakai dist/public yang sudah tersedia. ${error.message}`);
  } catch {
    throw error;
  }
}
