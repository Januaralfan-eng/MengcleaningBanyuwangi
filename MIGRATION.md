# P0 Security Patches — Migration Guide

Patch ini memperbaiki 4 isu kritikal tanpa mengurangi fitur publik (services, packages, blog, FAQ, booking, settings, admin). Satu fitur — perbandingan password admin di sisi client — DIPINDAH ke server-side karena tidak mungkin diamankan di client.

## Yang berubah

| File | Status | Inti perubahan |
|---|---|---|
| `api/_shared/data.js` | rewritten | `canWrite` fail-closed; redaksi password & PII booking; ganti `get()` Blob (tidak ada di v2) ke `list()+fetch()`; tambah `isAdminRequest`, `hashPassword`, `verifyPassword`, `verifyAdminCredentials`, `isValidBookingInput` |
| `api/site-settings.js` | minor | bungkus try/catch supaya body JSON invalid → 400, bukan 500 |
| `api/public-content.js` | minor | sama; admin (Bearer token) dapat respons full dengan PII, publik dapat versi redacted |
| `api/public-bookings.js` | minor | validasi input minimum + try/catch |
| `api/trpc/[trpc].js` | minor | `bookings.list`/`bookings.get` butuh Bearer token admin; batch dibatasi 24 prosedur; per-procedure error tidak menjatuhkan batch lain |
| `api/admin-login.js` | NEW | endpoint server-side untuk validasi username+password → kembalikan Bearer token |
| `scripts/hash-password.mjs` | NEW | helper bikin `ADMIN_PASSWORD_HASH` |

## Env vars yang WAJIB diset di Vercel sebelum deploy

```
BLOB_READ_WRITE_TOKEN     = (auto-injected oleh Vercel Blob integration)
CLEANAPP_SETTINGS_TOKEN   = <token random panjang, jadi Bearer admin>
ADMIN_USERNAME            = <username admin>
ADMIN_PASSWORD_HASH       = <hasil scripts/hash-password.mjs>
```

Cara generate:
```bash
# token admin (32 byte hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# password hash
node scripts/hash-password.mjs "PasswordRahasiaSaya"
```

Kalau `CLEANAPP_SETTINGS_TOKEN` TIDAK diset → semua endpoint write tertolak 401. Itu by-design (fail-closed).

## Dampak ke frontend (snapshot upstream)

Frontend snapshot saat ini melakukan login admin di sisi client dengan membaca `adminAccounts` dari `/api/public-content`. Setelah patch ini, response publik **tidak lagi mengandung password**. Jadi:

- Form login admin harus diubah untuk POST ke `/api/admin-login` dengan body `{username, password}`.
- Setelah dapat `{token}`, simpan di `sessionStorage`/`localStorage`.
- Tiap request admin harus kirim header `Authorization: Bearer <token>`:
  - `GET /api/public-content` (untuk dapat daftar booking + admin akun lengkap)
  - `GET /api/trpc/bookings.list`, `GET /api/trpc/bookings.get?input=<id>`
  - `PUT /api/public-content` — body harus `{ auth: { token: "<token>" }, content: {...} }`
  - `PUT /api/site-settings` — body harus `{ auth: { token: "<token>" }, settings: {...} }`

Snippet contoh perubahan frontend (di repo upstream tempat HTML/JS dibuild):

```js
// Login
const r = await fetch("/api/admin-login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ username, password })
});
if (!r.ok) throw new Error("login gagal");
const { token } = await r.json();
sessionStorage.setItem("adminToken", token);

// Request admin selanjutnya
const token = sessionStorage.getItem("adminToken");
await fetch("/api/trpc/bookings.list", {
  headers: { authorization: `Bearer ${token}` }
});

// Simpan setting
await fetch("/api/site-settings", {
  method: "PUT",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ auth: { token }, settings })
});
```

Selama frontend belum diupdate, **admin tidak bisa login lewat snapshot lama**, TAPI semua fitur publik (browse services, isi form booking, lihat blog, lihat kontak/WA) tetap jalan normal. Customer tidak terganggu.

## Verifikasi lokal sebelum deploy

```bash
# syntax check
node --check api/_shared/data.js
node --check api/site-settings.js
node --check api/public-content.js
node --check api/public-bookings.js
node --check api/trpc/[trpc].js
node --check api/admin-login.js
node --check scripts/hash-password.mjs

# unit smoke — hash + verify roundtrip
node -e "import('./api/_shared/data.js').then(m => { const h = m.hashPassword('test123'); console.log('hash:', h); console.log('match:', m.verifyPassword('test123', h)); console.log('wrong:', m.verifyPassword('xxx', h)); })"

# jalankan Vercel dev (butuh `vercel` CLI + `vercel link`)
npx vercel env pull .env.local
npx vercel dev
```

Test manual:

1. `GET /api/public-content` → tidak ada field `password` di `adminAccounts`, `bookings` hanya berisi id/packageId/date/status/createdAt.
2. `POST /api/admin-login` `{ "username": "admin", "password": "<pw>" }` → 200 + token.
3. `GET /api/trpc/bookings.list` tanpa header → `{ error: { ... code: "FORBIDDEN" } }`.
4. `GET /api/trpc/bookings.list` dengan header `Authorization: Bearer <token>` → array booking lengkap.
5. `PUT /api/site-settings` tanpa `auth.token` → 401.
6. `PUT /api/site-settings` dengan `{ auth: { token }, settings: {...} }` → 200 + persistent: true.
7. `POST /api/public-bookings` dengan body minim (`name`+`phone`+`packageId>0`) → 200; tanpa salah satunya → 400.

## Catatan tambahan

- Patch ini tidak mengenkripsi blob. URL blob bersifat publik (deterministik karena `addRandomSuffix: false`). Risiko: kalau attacker bisa menebak/menemukan store-id Vercel kamu, mereka bisa fetch JSON booking langsung. Mitigasi follow-up (P1): enkripsi AES-256-GCM dengan env key, atau pindah `bookings` ke Vercel KV/Postgres.
- Belum ada rate limit. POST booking masih bisa di-spam. Tambahkan Vercel Edge Middleware + Upstash Ratelimit (lihat audit P1 #11).
- API `@vercel/blob` v2 dipakai dengan `list()` + `fetch(blob.url)` karena `get()` tidak ada di v2. Pastikan versi `@vercel/blob` di `package.json` ≥ 0.22 (saat ini sudah `^2.3.3` — aman).
