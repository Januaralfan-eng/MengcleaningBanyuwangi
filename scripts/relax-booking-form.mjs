import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS_DIR = path.join(ROOT, "dist", "public", "assets");

const TARGET_PATTERN = /\(!o\.email\.trim\(\)\|\|!\/\^\[\^\\s@\]\+@\[\^\\s@\]\+\\\.\[\^\\s@\]\+\$\/\.test\(o\.email\)\)&&\(c\.email="[^"]+"\),o\.phone\.trim\(\)\|\|\(c\.phone="[^"]+"\),o\.address\.trim\(\)\|\|\(c\.address="[^"]+"\),/;
const REPLACEMENT = '(o.email.trim()&&!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(o.email))&&(c.email="Email tidak valid"),0,0,';

async function listBookingFormFiles() {
  try {
    const entries = await fs.readdir(ASSETS_DIR);
    return entries.filter((name) => /^BookingFormSection-[^.]+\.js$/.test(name));
  } catch {
    return [];
  }
}

async function patchFile(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  if (!TARGET_PATTERN.test(content)) {
    return { patched: false, reason: "pattern-not-found" };
  }
  const next = content.replace(TARGET_PATTERN, REPLACEMENT);
  await fs.writeFile(filePath, next, "utf-8");
  return { patched: true };
}

async function main() {
  const files = await listBookingFormFiles();
  if (files.length === 0) {
    console.warn("Relax-booking-form: tidak ada file BookingFormSection-*.js — dilewati.");
    return;
  }
  let patched = 0;
  let alreadyRelaxed = 0;
  for (const name of files) {
    const result = await patchFile(path.join(ASSETS_DIR, name));
    if (result.patched) {
      console.log(`Relax-booking-form: ${name} ter-patch (email/phone/address opsional).`);
      patched++;
    } else {
      console.warn(`Relax-booking-form: ${name} — pola validasi tidak ditemukan. Mungkin frontend upstream berubah; periksa skrip ini.`);
      alreadyRelaxed++;
    }
  }
  console.log(`Relax-booking-form: ${patched} ter-patch, ${alreadyRelaxed} dilewati.`);
}

main();
