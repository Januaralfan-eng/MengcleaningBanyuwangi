import { get, put } from "@vercel/blob";

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
  adminAccounts: [
    { id: "admin-default", username: "admin", password: "admin123" }
  ]
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

export function canWrite(auth) {
  const token = process.env.CLEANAPP_SETTINGS_TOKEN;
  if (!token) return true;
  return Boolean(auth && typeof auth === "object" && (auth.token === token || auth.password === token));
}

export function normalizeContent(value = {}) {
  return {
    services: asArray(value.services),
    packages: asArray(value.packages),
    blogPosts: asArray(value.blogPosts),
    portfolio: asArray(value.portfolio),
    bookings: asArray(value.bookings),
    faqs: asArray(value.faqs),
    adminAccounts: asArray(value.adminAccounts).length ? value.adminAccounts : defaultContent.adminAccounts
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
    const blob = await get(pathName, { access: "private" });
    if (!blob?.stream) return { data: fallback, source: "blob", persistent: true };
    return { data: normalize(JSON.parse(await new Response(blob.stream).text())), source: "blob", persistent: true };
  } catch (error) {
    console.warn(`[Blob] read failed for ${pathName}`, error);
    return { data: fallback, source: "default", persistent: false };
  }
}

async function writeBlob(pathName, data) {
  if (!hasBlobToken()) return false;
  await put(pathName, JSON.stringify(data), {
    access: "private",
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json"
  });
  return true;
}

export async function readPublicContent() {
  const result = await readBlob(CONTENT_PATH, defaultContent, normalizeContent);
  return {
    content: result.data,
    source: result.source,
    persistent: result.persistent,
    message: result.persistent ? "Konten online aktif." : "Storage konten online belum tersambung."
  };
}

export async function savePublicContent(value) {
  const content = normalizeContent(value);
  const persistent = await writeBlob(CONTENT_PATH, content);
  return {
    content,
    source: persistent ? "blob" : "memory",
    persistent,
    message: persistent ? "Konten online tersimpan." : "Konten tersimpan sementara."
  };
}

export async function appendPublicBooking(value) {
  const current = await readPublicContent();
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
    name: String(value.name || ""),
    email: String(value.email || ""),
    phone: String(value.phone || ""),
    address: String(value.address || ""),
    latitude: Number.isFinite(Number(value.latitude)) ? Number(value.latitude) : undefined,
    longitude: Number.isFinite(Number(value.longitude)) ? Number(value.longitude) : undefined,
    mapsUrl: String(value.mapsUrl || ""),
    locationSource: ["gps", "custom", "address"].includes(value.locationSource) ? value.locationSource : "address",
    packageId: Number.isFinite(Number(value.packageId)) ? Number(value.packageId) : 0,
    date: String(value.date || now),
    notes: String(value.notes || ""),
    status: ["pending", "confirmed", "completed", "cancelled"].includes(value.status) ? value.status : "pending",
    createdAt: String(value.createdAt || now)
  };
}

export async function readRequestBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === "string") return req.body ? JSON.parse(req.body) : {};
    return req.body || {};
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf-8");
  return raw ? JSON.parse(raw) : {};
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}
