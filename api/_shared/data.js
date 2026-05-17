import { list, put } from "@vercel/blob";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const CONTENT_PATH = "cleanapp/public-content.json";
const SETTINGS_PATH = "cleanapp/site-settings.json";

const defaultContent = {
  services: [
    { id: 1, name: "Layanan Pembersihan", description: "Pembersihan rumah, kantor, dan area usaha.", price: 100000 },
    { id: 2, name: "Perbaikan Listrik", description: "Perbaikan ringan instalasi dan perangkat listrik.", price: 150000 },
    { id: 3, name: "Perbaikan Kran & Saluran Air", description: "Perbaikan kebocoran dan saluran air ringan.", price: 150000 },
    { id: 4, name: "Perbaikan Plafon & Interior", description: "Perbaikan interior rumah ringan dan rapi.", price: 350000 }
  ],
  packages: [
    { id: 1, name: "Basic Clean & Care", price: 200000, duration: "2-4 Jam", cleaners: 4, features: "[]" },
    { id: 2, name: "Repair & Fix", price: 250000, duration: "3-6 Jam", cleaners: 5, features: "[]" },
    { id: 3, name: "Premium All-in-One", price: 350000, duration: "4-8 Jam", cleaners: 5, features: "[]" },
    { id: 4, name: "Layanan Tambahan (Add-on)", price: 100000, duration: "1-3 Jam", cleaners: 4, features: "[]" }
  ],
  blogPosts: [],
  portfolio: [],
  bookings: [],
  faqs: [],
  adminAccounts: []
};

const defaultSettings = {
  brandName: "Meng-Cleaning Banyuwangi",
  logoUrl: "",
  dashboardBackgroundUrl: "",
  heroTitle: "Home services Banyuwangi",
  heroSubtitle: "Layanan pembersihan, perbaikan dan perawatan rumah anda",
  heroBackgroundUrl: "",
  heroBackgroundFit: "cover",
  primaryColor: "#00A499",
  email: "kardiman.official@gmail.com",
  whatsapp: "+62 857-5521-1349",
  orderWhatsapp: "+62 851-5061-1178",
  orderWhatsappLabel: "Admin Pemesanan",
  facebook: "",
  linkedin: "",
  instagram: ""
};

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function constantTimeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    timingSafeEqual(ab, Buffer.alloc(ab.length));
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export function readAuthToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (typeof header === "string" && header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const x = req.headers?.["x-admin-token"];
  if (typeof x === "string" && x.length) return x.trim();
  return undefined;
}

export function isAdminRequest(req) {
  const token = process.env.CLEANAPP_SETTINGS_TOKEN;
  if (!token) return false;
  const supplied = readAuthToken(req);
  return supplied ? constantTimeEqual(supplied, token) : false;
}

export function canWrite(auth) {
  const token = process.env.CLEANAPP_SETTINGS_TOKEN;
  if (!token) return false;
  if (!auth || typeof auth !== "object") return false;
  return constantTimeEqual(auth.token, token) || constantTimeEqual(auth.password, token);
}

const SCRYPT_KEYLEN = 64;
const SCRYPT_SALTLEN = 16;

export function hashPassword(plain) {
  const salt = randomBytes(SCRYPT_SALTLEN);
  const derived = scryptSync(plain, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(plain, encoded) {
  if (typeof encoded !== "string") return false;
  const [scheme, saltHex, hashHex] = encoded.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const derived = scryptSync(plain, salt, expected.length);
    return timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

export async function verifyAdminCredentials(username, password) {
  const envUser = process.env.ADMIN_USERNAME;
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (envUser && envHash && constantTimeEqual(username, envUser)) {
    return verifyPassword(password, envHash);
  }
  const { content } = await readPublicContentRaw();
  for (const acct of content.adminAccounts || []) {
    if (constantTimeEqual(String(acct.username || ""), username)) {
      return verifyPassword(password, acct.password);
    }
  }
  return false;
}

export function normalizeContent(value = {}) {
  return {
    services: asArray(value.services),
    packages: asArray(value.packages),
    blogPosts: asArray(value.blogPosts),
    portfolio: asArray(value.portfolio),
    bookings: asArray(value.bookings),
    faqs: asArray(value.faqs),
    adminAccounts: asArray(value.adminAccounts)
  };
}

export function normalizeSettings(value = {}) {
  return {
    ...defaultSettings,
    ...Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === "string")),
    heroBackgroundFit: value.heroBackgroundFit === "contain" ? "contain" : "cover"
  };
}

async function readBlob(pathName, fallback, normalize) {
  if (!hasBlobToken()) return { data: fallback, source: "default", persistent: false };
  try {
    const { blobs } = await list({ prefix: pathName, limit: 5 });
    const blob = blobs.find((b) => b.pathname === pathName);
    if (!blob) return { data: fallback, source: "blob-empty", persistent: true };
    const response = await fetch(blob.url, {
      cache: "no-store",
      headers: { authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
    });
    if (!response.ok) throw new Error(`fetch ${blob.url} -> ${response.status}`);
    const json = await response.json();
    return { data: normalize(json), source: "blob", persistent: true };
  } catch (error) {
    console.warn(`[Blob] read failed for ${pathName}:`, error?.message || error);
    return { data: fallback, source: "default", persistent: false };
  }
}

async function writeBlob(pathName, data) {
  if (!hasBlobToken()) return false;
  try {
    await put(pathName, JSON.stringify(data), {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
      contentType: "application/json"
    });
    return true;
  } catch (error) {
    console.warn(`[Blob] write failed for ${pathName}:`, error?.message || error);
    return false;
  }
}

function redactAdminAccounts(content) {
  return {
    ...content,
    adminAccounts: (content.adminAccounts || []).map(({ password, ...rest }) => ({
      ...rest,
      hasPassword: Boolean(password)
    }))
  };
}

function redactBookings(content) {
  return {
    ...content,
    bookings: (content.bookings || []).map((b) => ({
      id: b.id,
      packageId: b.packageId,
      date: b.date,
      status: b.status,
      createdAt: b.createdAt
    }))
  };
}

async function readPublicContentRaw() {
  const result = await readBlob(CONTENT_PATH, defaultContent, normalizeContent);
  return { content: result.data, source: result.source, persistent: result.persistent };
}

export async function readPublicContent(options = {}) {
  const raw = await readPublicContentRaw();
  const content = options.includeSecrets ? raw.content : redactBookings(redactAdminAccounts(raw.content));
  return {
    content,
    source: raw.source,
    persistent: raw.persistent,
    message: raw.persistent ? "Konten online aktif." : "Storage konten online belum tersambung."
  };
}

export async function savePublicContent(value) {
  const content = normalizeContent(value);
  const persistent = await writeBlob(CONTENT_PATH, content);
  return {
    content: redactBookings(redactAdminAccounts(content)),
    source: persistent ? "blob" : "memory",
    persistent,
    message: persistent ? "Konten online tersimpan." : "Konten tersimpan sementara."
  };
}

export async function appendPublicBooking(value) {
  const current = await readPublicContentRaw();
  const booking = normalizeBooking(value);
  const next = normalizeContent({
    ...current.content,
    bookings: [booking, ...current.content.bookings.filter((item) => item.id !== booking.id)]
  });
  return savePublicContent(next);
}

export async function readSiteSettings() {
  const result = await readBlob(SETTINGS_PATH, defaultSettings, normalizeSettings);
  return {
    settings: result.data,
    source: result.source,
    persistent: result.persistent,
    message: result.persistent ? "Pengaturan online aktif." : "Storage online belum tersambung."
  };
}

export async function saveSiteSettings(value) {
  const settings = normalizeSettings(value);
  const persistent = await writeBlob(SETTINGS_PATH, settings);
  return {
    settings,
    source: persistent ? "blob" : "memory",
    persistent,
    message: persistent ? "Pengaturan online tersimpan." : "Pengaturan tersimpan sementara."
  };
}

export function normalizeBooking(value = {}) {
  const now = new Date().toISOString();
  const id = Number.isFinite(Number(value.id)) ? Number(value.id) : Date.now();
  return {
    id,
    name: String(value.name || "").slice(0, 200),
    email: String(value.email || "").slice(0, 200),
    phone: String(value.phone || "").slice(0, 50),
    address: String(value.address || "").slice(0, 500),
    latitude: Number.isFinite(Number(value.latitude)) ? Number(value.latitude) : undefined,
    longitude: Number.isFinite(Number(value.longitude)) ? Number(value.longitude) : undefined,
    mapsUrl: String(value.mapsUrl || "").slice(0, 1000),
    locationSource: ["gps", "custom", "address"].includes(value.locationSource) ? value.locationSource : "address",
    packageId: Number.isFinite(Number(value.packageId)) ? Number(value.packageId) : 0,
    date: String(value.date || now),
    notes: String(value.notes || "").slice(0, 2000),
    status: ["pending", "confirmed", "completed", "cancelled"].includes(value.status) ? value.status : "pending",
    createdAt: String(value.createdAt || now)
  };
}

export function isValidBookingInput(value) {
  if (!value || typeof value !== "object") return false;
  const hasName = String(value.name || "").trim().length > 0;
  const hasPackage = Number.isFinite(Number(value.packageId)) && Number(value.packageId) > 0;
  return hasName && hasPackage;
}

export async function readRequestBody(req) {
  try {
    if (req.body !== undefined) {
      if (typeof req.body === "string") return req.body ? JSON.parse(req.body) : {};
      return req.body || {};
    }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf-8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    const err = new Error("Body JSON tidak valid");
    err.statusCode = 400;
    throw err;
  }
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}
