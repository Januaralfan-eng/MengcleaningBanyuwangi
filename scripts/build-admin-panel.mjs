import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dist", "public", "admin.html");

const HTML = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<title>Admin · Meng-Cleaning Banyuwangi</title>
<style>
  *,*::before,*::after{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f5f7fa;color:#1f2937;line-height:1.5}
  header{background:#00A499;color:#fff;padding:1rem 1.25rem;display:flex;justify-content:space-between;align-items:center;box-shadow:0 1px 3px rgba(0,0,0,.08);position:sticky;top:0;z-index:10}
  header h1{margin:0;font-size:1.125rem;font-weight:600}
  header .right{display:flex;gap:.5rem;align-items:center;font-size:.875rem}
  header .user{opacity:.85}
  header button{background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3);padding:.4rem .75rem;border-radius:.375rem;cursor:pointer;font-size:.875rem}
  header button:hover{background:rgba(255,255,255,.3)}
  .layout{display:flex;align-items:stretch;min-height:calc(100vh - 56px)}
  .sidebar{width:220px;flex-shrink:0;background:#fff;border-right:1px solid #e5e7eb;padding:1rem .5rem;display:flex;flex-direction:column;gap:.25rem}
  .sidebar .nav-item{display:flex;align-items:center;gap:.6rem;padding:.6rem .85rem;border:none;background:none;color:#374151;font-size:.9rem;font-family:inherit;cursor:pointer;border-radius:.375rem;text-align:left;width:100%}
  .sidebar .nav-item:hover{background:#f3f4f6}
  .sidebar .nav-item.active{background:#e6f8f6;color:#00746c;font-weight:600}
  .sidebar .nav-section{font-size:.7rem;text-transform:uppercase;color:#9ca3af;font-weight:600;letter-spacing:.05em;padding:.75rem .85rem .25rem}
  .sidebar-toggle{display:none;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:#fff;padding:.4rem .65rem;border-radius:.375rem;cursor:pointer;margin-right:.5rem}
  main{flex:1;max-width:960px;padding:1.25rem;width:100%}
  @media (max-width:768px){
    .layout{flex-direction:column}
    .sidebar{width:100%;border-right:none;border-bottom:1px solid #e5e7eb;padding:.5rem;flex-direction:row;overflow-x:auto;gap:.25rem;display:none}
    .sidebar.open{display:flex}
    .sidebar .nav-item{white-space:nowrap;padding:.45rem .75rem}
    .sidebar .nav-section{display:none}
    .sidebar-toggle{display:inline-block}
    main{padding:1rem}
  }
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:.5rem;padding:1.25rem;margin-bottom:1rem;box-shadow:0 1px 2px rgba(0,0,0,.04)}
  h2{margin:0 0 .75rem;font-size:1rem;font-weight:600;color:#111827}
  label{display:block;font-size:.85rem;font-weight:500;margin-bottom:.25rem;color:#374151}
  input,textarea,select{width:100%;padding:.5rem .65rem;border:1px solid #d1d5db;border-radius:.375rem;font-size:.9rem;font-family:inherit;background:#fff}
  input:focus,textarea:focus,select:focus{outline:2px solid #00A499;outline-offset:-1px;border-color:#00A499}
  textarea{min-height:80px;resize:vertical}
  textarea.long{min-height:200px}
  .row{margin-bottom:.75rem}
  .row2{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem}
  @media (max-width: 600px){.row2{grid-template-columns:1fr}}
  .actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem}
  button.primary{background:#00A499;color:#fff;border:none;padding:.55rem 1rem;border-radius:.375rem;cursor:pointer;font-size:.9rem;font-weight:500}
  button.primary:hover{background:#008c83}
  button.primary:disabled{background:#9ca3af;cursor:not-allowed}
  button.ghost{background:#fff;color:#374151;border:1px solid #d1d5db;padding:.5rem .85rem;border-radius:.375rem;cursor:pointer;font-size:.85rem}
  button.ghost:hover{background:#f3f4f6}
  button.danger{background:#fff;color:#dc2626;border:1px solid #fecaca;padding:.4rem .65rem;border-radius:.375rem;cursor:pointer;font-size:.8rem}
  button.danger:hover{background:#fef2f2}
  .panel{display:none}
  .panel.active{display:block}
  .item{padding:.85rem;border:1px solid #e5e7eb;border-radius:.375rem;margin-bottom:.5rem;background:#fafbfc;display:flex;gap:.85rem}
  .item .thumb{flex-shrink:0;width:64px;height:64px;border-radius:.25rem;background:#e5e7eb url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E") center/30% no-repeat;background-size:cover;background-position:center;border:1px solid #e5e7eb}
  .item .body{flex:1;min-width:0}
  .item-header{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.35rem;flex-wrap:wrap}
  .item-title{font-weight:600;color:#111827;flex:1;min-width:0}
  .item-meta{font-size:.8rem;color:#6b7280;margin-top:.25rem}
  .item-body{font-size:.875rem;color:#4b5563;white-space:pre-wrap;overflow-wrap:anywhere}
  .empty{padding:2rem;text-align:center;color:#9ca3af;font-size:.9rem}
  .toast{position:fixed;bottom:1rem;right:1rem;background:#111827;color:#fff;padding:.6rem 1rem;border-radius:.375rem;font-size:.875rem;box-shadow:0 4px 12px rgba(0,0,0,.15);opacity:0;transition:opacity .2s;pointer-events:none;z-index:50;max-width:340px}
  .toast.show{opacity:1}
  .toast.error{background:#dc2626}
  .toast.success{background:#059669}
  #login{max-width:380px;margin:4rem auto;padding:1.5rem}
  #login h2{font-size:1.25rem;margin-bottom:1rem;text-align:center}
  .hidden{display:none!important}
  .hint{font-size:.8rem;color:#6b7280;margin-top:.25rem}
  .preview-img{max-width:160px;max-height:120px;border-radius:.25rem;border:1px solid #e5e7eb;display:block;margin-top:.4rem;object-fit:cover}
  .price{color:#00A499;font-weight:700}
  .badge{display:inline-block;padding:.1rem .4rem;border-radius:.25rem;font-size:.7rem;font-weight:600;background:#e5e7eb;color:#374151}
  .badge.green{background:#d1fae5;color:#065f46}
  .badge.amber{background:#fef3c7;color:#92400e}
  .badge.red{background:#fee2e2;color:#991b1b}
  .modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);display:none;align-items:flex-start;justify-content:center;padding:2rem 1rem;overflow-y:auto;z-index:40}
  .modal-overlay.open{display:flex}
  .modal{background:#fff;border-radius:.5rem;max-width:640px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.2)}
  .modal-head{padding:1rem 1.25rem;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center}
  .modal-head h3{margin:0;font-size:1.05rem}
  .modal-close{background:none;border:none;font-size:1.4rem;cursor:pointer;color:#6b7280;line-height:1}
  .modal-body{padding:1.25rem}
  .modal-foot{padding:1rem 1.25rem;border-top:1px solid #e5e7eb;display:flex;gap:.5rem;flex-wrap:wrap;justify-content:flex-end}
  .field{display:flex;gap:.5rem;padding:.4rem 0;border-bottom:1px solid #f1f5f9;font-size:.875rem}
  .field:last-child{border-bottom:0}
  .field-label{flex:0 0 110px;color:#6b7280;font-weight:500}
  .field-value{flex:1;color:#111827;word-break:break-word}
  .field-value a{color:#0284c7;text-decoration:none}
  .field-value a:hover{text-decoration:underline}
  .toolbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem}
  .clickable{cursor:pointer;transition:background .12s}
  .clickable:hover{background:#f3f4f6}
  .section-title{margin:1.25rem 0 .5rem;padding-top:.5rem;border-top:1px solid #f1f5f9;font-size:.85rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em}
  .section-title:first-child{border-top:0;padding-top:0;margin-top:0}
</style>
</head>
<body>

<div id="login" class="card">
  <h2>Admin Login</h2>
  <form id="login-form">
    <div class="row">
      <label for="login-username">Username</label>
      <input id="login-username" name="username" type="text" required autocomplete="username" />
    </div>
    <div class="row">
      <label for="login-password">Password</label>
      <input id="login-password" name="password" type="password" required autocomplete="current-password" />
    </div>
    <div class="actions">
      <button class="primary" type="submit" id="login-btn">Masuk</button>
    </div>
  </form>
</div>

<div id="app" class="hidden">
  <header>
    <div style="display:flex;align-items:center">
      <button class="sidebar-toggle" id="sidebar-toggle" type="button" aria-label="Menu">☰</button>
      <h1>Meng-Cleaning Banyuwangi · Admin</h1>
    </div>
    <div class="right">
      <span class="user" id="user-label"></span>
      <button id="logout-btn" type="button">Logout</button>
    </div>
  </header>
  <div class="layout">
    <nav class="sidebar" id="sidebar">
      <div class="nav-section">Konten</div>
      <button class="nav-item active" data-tab="faq" type="button">FAQ</button>
      <button class="nav-item" data-tab="services" type="button">Layanan</button>
      <button class="nav-item" data-tab="packages" type="button">Paket</button>
      <button class="nav-item" data-tab="blog" type="button">Blog</button>
      <button class="nav-item" data-tab="portfolio" type="button">Portfolio</button>
      <div class="nav-section">Operasi</div>
      <button class="nav-item" data-tab="bookings" type="button">Booking</button>
      <button class="nav-item" data-tab="settings" type="button">Pengaturan</button>
      <button class="nav-item" data-tab="admins" type="button">Daftar Admin</button>
    </nav>
  <main>

    <div id="panel-faq" class="panel active">
      <div class="card">
        <h2 id="faq-form-title">Tambah FAQ</h2>
        <form id="faq-form">
          <input type="hidden" id="faq-id" />
          <div class="row"><label>Pertanyaan</label><input id="faq-question" required maxlength="300" /></div>
          <div class="row"><label>Jawaban</label><textarea id="faq-answer" required maxlength="2000"></textarea></div>
          <div class="actions">
            <button class="primary" type="submit">Simpan</button>
            <button class="ghost" type="button" data-reset="faq">Reset</button>
          </div>
        </form>
      </div>
      <div class="card">
        <h2>Daftar FAQ <span class="hint" id="faq-count"></span></h2>
        <div id="faq-list"><div class="empty">Memuat…</div></div>
      </div>
    </div>

    <div id="panel-services" class="panel">
      <div class="card">
        <h2 id="services-form-title">Tambah Layanan</h2>
        <form id="services-form">
          <input type="hidden" id="services-id" />
          <div class="row"><label>Nama Layanan</label><input id="services-name" required maxlength="200" /></div>
          <div class="row"><label>Deskripsi</label><textarea id="services-description" maxlength="2000"></textarea></div>
          <div class="row"><label>Harga (Rp)</label><input id="services-price" type="number" min="0" step="1000" required /></div>
          <div class="actions">
            <button class="primary" type="submit">Simpan</button>
            <button class="ghost" type="button" data-reset="services">Reset</button>
          </div>
        </form>
      </div>
      <div class="card">
        <h2>Daftar Layanan <span class="hint" id="services-count"></span></h2>
        <div id="services-list"><div class="empty">Memuat…</div></div>
      </div>
    </div>

    <div id="panel-packages" class="panel">
      <div class="card">
        <h2 id="packages-form-title">Tambah Paket</h2>
        <form id="packages-form">
          <input type="hidden" id="packages-id" />
          <div class="row"><label>Nama Paket</label><input id="packages-name" required maxlength="200" /></div>
          <div class="row2">
            <div><label>Harga (Rp)</label><input id="packages-price" type="number" min="0" step="1000" required /></div>
            <div><label>Jumlah Cleaner</label><input id="packages-cleaners" type="number" min="1" max="20" required /></div>
          </div>
          <div class="row"><label>Durasi</label><input id="packages-duration" placeholder="contoh: 2-4 Jam" maxlength="100" /></div>
          <div class="row">
            <label>Fitur (satu per baris)</label>
            <textarea id="packages-features" placeholder="Pembersihan rumah (lantai, kamar, dapur)&#10;Laundry pakaian&#10;Cuci sofa"></textarea>
            <div class="hint">Tiap baris jadi 1 fitur. Akan disimpan sebagai JSON array.</div>
          </div>
          <div class="actions">
            <button class="primary" type="submit">Simpan</button>
            <button class="ghost" type="button" data-reset="packages">Reset</button>
          </div>
        </form>
      </div>
      <div class="card">
        <h2>Daftar Paket <span class="hint" id="packages-count"></span></h2>
        <div id="packages-list"><div class="empty">Memuat…</div></div>
      </div>
    </div>

    <div id="panel-blog" class="panel">
      <div class="card">
        <h2 id="blog-form-title">Tambah Artikel Blog</h2>
        <form id="blog-form">
          <input type="hidden" id="blog-id" />
          <div class="row"><label>Judul</label><input id="blog-title" required maxlength="300" /></div>
          <div class="row2">
            <div><label>Slug (URL)</label><input id="blog-slug" maxlength="200" placeholder="auto-generate dari judul" /></div>
            <div><label>Kategori</label><input id="blog-category" maxlength="100" /></div>
          </div>
          <div class="row"><label>Ringkasan (excerpt)</label><textarea id="blog-excerpt" maxlength="500"></textarea></div>
          <div class="row"><label>Isi Artikel</label><textarea id="blog-content" class="long" maxlength="50000"></textarea></div>
          <div class="row">
            <label>Gambar Cover</label>
            <input id="blog-image-file" type="file" accept="image/*" />
            <input id="blog-image-url" type="hidden" />
            <img id="blog-image-preview" class="preview-img hidden" alt="preview" />
            <div class="hint">File akan disimpan sebagai base64 (maks ~500KB).</div>
          </div>
          <div class="actions">
            <button class="primary" type="submit">Simpan</button>
            <button class="ghost" type="button" data-reset="blog">Reset</button>
          </div>
        </form>
      </div>
      <div class="card">
        <h2>Daftar Blog <span class="hint" id="blog-count"></span></h2>
        <div id="blog-list"><div class="empty">Memuat…</div></div>
      </div>
    </div>

    <div id="panel-portfolio" class="panel">
      <div class="card">
        <h2 id="portfolio-form-title">Tambah Portfolio</h2>
        <form id="portfolio-form">
          <input type="hidden" id="portfolio-id" />
          <div class="row"><label>Judul</label><input id="portfolio-title" required maxlength="200" /></div>
          <div class="row"><label>Deskripsi</label><textarea id="portfolio-description" maxlength="2000"></textarea></div>
          <div class="row">
            <label>Gambar</label>
            <input id="portfolio-image-file" type="file" accept="image/*" />
            <input id="portfolio-image-url" type="hidden" />
            <img id="portfolio-image-preview" class="preview-img hidden" alt="preview" />
          </div>
          <div class="actions">
            <button class="primary" type="submit">Simpan</button>
            <button class="ghost" type="button" data-reset="portfolio">Reset</button>
          </div>
        </form>
      </div>
      <div class="card">
        <h2>Daftar Portfolio <span class="hint" id="portfolio-count"></span></h2>
        <div id="portfolio-list"><div class="empty">Memuat…</div></div>
      </div>
    </div>

    <div id="panel-bookings" class="panel">
      <div class="card">
        <div class="toolbar">
          <h2 style="margin:0">Booking <span class="hint" id="booking-count"></span></h2>
          <div class="actions">
            <select id="booking-filter" style="width:auto"><option value="">Semua status</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
            <button class="ghost" type="button" id="booking-refresh">Refresh</button>
            <button class="primary" type="button" id="booking-export">Export Excel</button>
          </div>
        </div>
        <div id="booking-list"><div class="empty">Memuat…</div></div>
      </div>
    </div>

    <div id="panel-admins" class="panel">
      <div class="card">
        <h2 id="admins-form-title">Tambah Admin</h2>
        <form id="admins-form">
          <input type="hidden" id="admins-id" />
          <div class="row2">
            <div><label>Username</label><input id="admins-username" required maxlength="80" /></div>
            <div><label>Password baru</label><input id="admins-password" type="password" maxlength="200" placeholder="kosongkan kalau tidak ganti (saat edit)" /></div>
          </div>
          <div class="hint">Password akan di-hash scrypt sebelum disimpan. Saat edit, kosongkan kalau tidak mau ganti password.</div>
          <div class="actions">
            <button class="primary" type="submit">Simpan</button>
            <button class="ghost" type="button" data-reset="admins">Reset</button>
          </div>
        </form>
      </div>
      <div class="card">
        <h2>Daftar Admin <span class="hint" id="admins-count"></span></h2>
        <div id="admins-list"><div class="empty">Memuat…</div></div>
      </div>
    </div>

    <div id="panel-settings" class="panel" data-no-close-sidebar>
      <div class="card">
        <h2>Pengaturan Situs</h2>
        <form id="settings-form">
          <div class="row"><label>Nama Brand</label><input id="settings-brandName" maxlength="200" /></div>
          <div class="row2">
            <div>
              <label>Logo</label>
              <input id="settings-logoFile" type="file" accept="image/*" />
              <input id="settings-logoUrl" type="hidden" />
              <img id="settings-logoPreview" class="preview-img hidden" alt="logo" />
            </div>
            <div>
              <label>Background Dashboard (opsional)</label>
              <input id="settings-dashboardBackgroundFile" type="file" accept="image/*" />
              <input id="settings-dashboardBackgroundUrl" type="hidden" />
              <img id="settings-dashboardBackgroundPreview" class="preview-img hidden" alt="dashboard bg" />
            </div>
          </div>
          <div class="row"><label>Hero — Judul</label><input id="settings-heroTitle" maxlength="200" /></div>
          <div class="row"><label>Hero — Subjudul</label><input id="settings-heroSubtitle" maxlength="500" /></div>
          <div class="row2">
            <div>
              <label>Hero — Background</label>
              <input id="settings-heroBackgroundFile" type="file" accept="image/*" />
              <input id="settings-heroBackgroundUrl" type="hidden" />
              <img id="settings-heroBackgroundPreview" class="preview-img hidden" alt="hero bg" />
            </div>
            <div>
              <label>Hero Fit</label>
              <select id="settings-heroBackgroundFit"><option value="cover">cover</option><option value="contain">contain</option></select>
              <label style="margin-top:.5rem">Warna Primer</label>
              <input id="settings-primaryColor" type="color" />
            </div>
          </div>
          <div class="row2">
            <div><label>Email Kontak</label><input id="settings-email" type="email" maxlength="200" /></div>
            <div><label>WhatsApp Utama</label><input id="settings-whatsapp" maxlength="50" /></div>
          </div>
          <div class="row2">
            <div><label>WhatsApp Order</label><input id="settings-orderWhatsapp" maxlength="50" /></div>
            <div><label>Label Order</label><input id="settings-orderWhatsappLabel" maxlength="100" /></div>
          </div>
          <div class="row2">
            <div><label>Facebook URL</label><input id="settings-facebook" maxlength="500" /></div>
            <div><label>Instagram URL</label><input id="settings-instagram" maxlength="500" /></div>
          </div>
          <div class="row"><label>LinkedIn URL</label><input id="settings-linkedin" maxlength="500" /></div>
          <div class="actions">
            <button class="primary" type="submit">Simpan Pengaturan</button>
            <button class="ghost" type="button" id="settings-reload">Muat Ulang</button>
            <button class="danger" type="button" id="settings-reset" style="margin-left:auto">Reset Pengaturan</button>
          </div>
        </form>
      </div>
    </div>
  </main>
  </div>
</div>

<div id="modal" class="modal-overlay" role="dialog" aria-modal="true">
  <div class="modal">
    <div class="modal-head"><h3 id="modal-title">Detail</h3><button class="modal-close" id="modal-close" type="button" aria-label="Tutup">×</button></div>
    <div class="modal-body" id="modal-body"></div>
    <div class="modal-foot" id="modal-foot"></div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script>
(function(){
  const TOKEN_KEY = "cleanapp-admin-token-v1";
  const USER_KEY = "cleanapp-admin-user-v1";
  const $ = (id) => document.getElementById(id);
  const ESC = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]);
  const fmtIDR = (n) => "Rp " + (Number(n)||0).toLocaleString("id-ID");

  function token() { return sessionStorage.getItem(TOKEN_KEY); }
  function setToken(t, user) {
    if (t) { sessionStorage.setItem(TOKEN_KEY, t); if (user) sessionStorage.setItem(USER_KEY, user); }
    else { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); }
  }

  function toast(msg, type) {
    const el = $("toast");
    el.textContent = msg;
    el.className = "toast show " + (type || "");
    setTimeout(() => { el.className = "toast"; }, 2800);
  }

  async function api(p, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ "content-type": "application/json" }, opts.headers || {});
    const t = token();
    if (t) opts.headers.authorization = "Bearer " + t;
    const r = await fetch(p, opts);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (data && (typeof data.error === "string" ? data.error : (data.error && data.error.message))) || ("HTTP " + r.status);
      throw new Error(msg);
    }
    return data;
  }

  function show(view) {
    $("login").classList.toggle("hidden", view !== "login");
    $("app").classList.toggle("hidden", view !== "app");
  }

  let cachedContent = null;
  let cachedSettings = null;

  async function loadContent() {
    const r = await api("/api/public-content");
    cachedContent = r.content || {};
    return cachedContent;
  }

  async function saveContent(content) {
    const r = await api("/api/public-content", {
      method: "PUT",
      body: JSON.stringify({ auth: { token: token() }, content })
    });
    cachedContent = r.content || {};
    return r;
  }

  async function loadSettings() {
    const r = await api("/api/site-settings");
    cachedSettings = r.settings || {};
    return cachedSettings;
  }

  async function saveSettings(settings) {
    const r = await api("/api/site-settings", {
      method: "PUT",
      body: JSON.stringify({ auth: { token: token() }, settings })
    });
    cachedSettings = r.settings || {};
    return r;
  }

  function fileToDataUrl(file, maxBytes) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve("");
      if (maxBytes && file.size > maxBytes) return reject(new Error("Ukuran file melebihi " + Math.round(maxBytes/1024) + " KB"));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Gagal baca file"));
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  function slugify(s) {
    return String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  }

  $("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("login-btn");
    btn.disabled = true; btn.textContent = "Memeriksa…";
    try {
      const username = $("login-username").value.trim();
      const r = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password: $("login-password").value })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Login gagal");
      setToken(data.token, username);
      $("login-password").value = "";
      toast("Login berhasil", "success");
      show("app");
      $("user-label").textContent = username;
      switchTab("faq");
    } catch (err) {
      toast(err.message || "Login gagal", "error");
    } finally {
      btn.disabled = false; btn.textContent = "Masuk";
    }
  });

  $("logout-btn").addEventListener("click", () => { setToken(null); show("login"); toast("Keluar dari admin"); });

  function switchTab(name) {
    document.querySelectorAll(".nav-item").forEach(x => x.classList.toggle("active", x.dataset.tab === name));
    document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
    const loaders = { faq: loadFaqs, services: loadServices, packages: loadPackages, blog: loadBlog, portfolio: loadPortfolio, bookings: loadBookings, settings: loadSettingsForm, admins: loadAdmins };
    (loaders[name] || (()=>{}))();
    if (window.innerWidth <= 768) $("sidebar").classList.remove("open");
  }

  document.querySelectorAll(".nav-item").forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));
  $("sidebar-toggle").addEventListener("click", () => $("sidebar").classList.toggle("open"));

  document.querySelectorAll("[data-reset]").forEach((b) => b.addEventListener("click", () => resetForm(b.dataset.reset)));

  function resetForm(kind) {
    const form = $(kind + "-form");
    if (!form) return;
    form.reset();
    const idEl = $(kind + "-id"); if (idEl) idEl.value = "";
    const titleEl = $(kind + "-form-title"); if (titleEl) titleEl.textContent = ({ faq: "Tambah FAQ", services: "Tambah Layanan", packages: "Tambah Paket", blog: "Tambah Artikel Blog", portfolio: "Tambah Portfolio", admins: "Tambah Admin" }[kind] || "Tambah");
    if (kind === "blog") { $("blog-image-url").value=""; $("blog-image-preview").classList.add("hidden"); $("blog-image-preview").src=""; }
    if (kind === "portfolio") { $("portfolio-image-url").value=""; $("portfolio-image-preview").classList.add("hidden"); $("portfolio-image-preview").src=""; }
  }

  // ===== FAQ =====
  async function loadFaqs() {
    const list = $("faq-list");
    list.innerHTML = '<div class="empty">Memuat…</div>';
    try {
      const c = await loadContent();
      const faqs = Array.isArray(c.faqs) ? c.faqs : [];
      $("faq-count").textContent = "(" + faqs.length + ")";
      if (!faqs.length) { list.innerHTML = '<div class="empty">Belum ada FAQ.</div>'; return; }
      list.innerHTML = faqs.map((f) => '<div class="item"><div class="body"><div class="item-header"><div class="item-title">' + ESC(f.question) + '</div><div class="actions"><button class="ghost" data-edit-faq="' + ESC(f.id) + '" type="button">Edit</button><button class="danger" data-del-faq="' + ESC(f.id) + '" type="button">Hapus</button></div></div><div class="item-body">' + ESC(f.answer) + '</div></div></div>').join("");
      list.querySelectorAll("[data-edit-faq]").forEach((b) => b.addEventListener("click", () => editFaq(b.dataset.editFaq)));
      list.querySelectorAll("[data-del-faq]").forEach((b) => b.addEventListener("click", () => delFaq(b.dataset.delFaq)));
    } catch (e) { list.innerHTML = '<div class="empty">Gagal: ' + ESC(e.message) + '</div>'; }
  }
  function editFaq(id) {
    const f = (cachedContent.faqs||[]).find(x => String(x.id) === String(id));
    if (!f) return;
    $("faq-id").value = f.id; $("faq-question").value = f.question||""; $("faq-answer").value = f.answer||"";
    $("faq-form-title").textContent = "Edit FAQ #" + f.id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function delFaq(id) {
    if (!confirm("Hapus FAQ ini?")) return;
    try { const c = await loadContent(); await saveContent({ ...c, faqs: (c.faqs||[]).filter(f => String(f.id) !== String(id)) }); toast("FAQ dihapus","success"); loadFaqs(); } catch(e){ toast(e.message,"error"); }
  }
  $("faq-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("faq-id").value.trim();
    const question = $("faq-question").value.trim();
    const answer = $("faq-answer").value.trim();
    if (!question || !answer) return toast("Wajib isi pertanyaan & jawaban","error");
    try {
      const c = await loadContent();
      const list = Array.isArray(c.faqs) ? c.faqs.slice() : [];
      if (id) { const i = list.findIndex(f => String(f.id) === String(id)); if (i>=0) list[i] = { ...list[i], question, answer }; }
      else { list.push({ id: Date.now(), question, answer }); }
      await saveContent({ ...c, faqs: list });
      toast(id ? "FAQ diperbarui" : "FAQ ditambahkan","success");
      resetForm("faq"); loadFaqs();
    } catch(e){ toast(e.message,"error"); }
  });

  // ===== SERVICES =====
  async function loadServices() {
    const list = $("services-list"); list.innerHTML = '<div class="empty">Memuat…</div>';
    try {
      const c = await loadContent(); const items = Array.isArray(c.services) ? c.services : [];
      $("services-count").textContent = "(" + items.length + ")";
      if (!items.length) { list.innerHTML = '<div class="empty">Belum ada layanan.</div>'; return; }
      list.innerHTML = items.map((s) => '<div class="item"><div class="body"><div class="item-header"><div class="item-title">' + ESC(s.name) + ' <span class="badge green">' + fmtIDR(s.price) + '</span></div><div class="actions"><button class="ghost" data-edit-services="' + ESC(s.id) + '" type="button">Edit</button><button class="danger" data-del-services="' + ESC(s.id) + '" type="button">Hapus</button></div></div><div class="item-body">' + ESC(s.description) + '</div></div></div>').join("");
      list.querySelectorAll("[data-edit-services]").forEach((b) => b.addEventListener("click", () => editService(b.dataset.editServices)));
      list.querySelectorAll("[data-del-services]").forEach((b) => b.addEventListener("click", () => delService(b.dataset.delServices)));
    } catch (e) { list.innerHTML = '<div class="empty">Gagal: ' + ESC(e.message) + '</div>'; }
  }
  function editService(id) {
    const s = (cachedContent.services||[]).find(x => String(x.id) === String(id)); if (!s) return;
    $("services-id").value = s.id; $("services-name").value = s.name||""; $("services-description").value = s.description||""; $("services-price").value = s.price||0;
    $("services-form-title").textContent = "Edit Layanan #" + s.id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function delService(id) {
    if (!confirm("Hapus layanan ini?")) return;
    try { const c = await loadContent(); await saveContent({ ...c, services: (c.services||[]).filter(s => String(s.id) !== String(id)) }); toast("Layanan dihapus","success"); loadServices(); } catch(e){ toast(e.message,"error"); }
  }
  $("services-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("services-id").value.trim();
    const name = $("services-name").value.trim();
    const description = $("services-description").value.trim();
    const price = Number($("services-price").value)||0;
    if (!name) return toast("Wajib isi nama","error");
    try {
      const c = await loadContent();
      const list = Array.isArray(c.services) ? c.services.slice() : [];
      if (id) { const i = list.findIndex(s => String(s.id) === String(id)); if (i>=0) list[i] = { ...list[i], name, description, price }; }
      else { list.push({ id: Date.now(), name, description, price }); }
      await saveContent({ ...c, services: list });
      toast(id ? "Layanan diperbarui" : "Layanan ditambahkan","success");
      resetForm("services"); loadServices();
    } catch(e){ toast(e.message,"error"); }
  });

  // ===== PACKAGES =====
  async function loadPackages() {
    const list = $("packages-list"); list.innerHTML = '<div class="empty">Memuat…</div>';
    try {
      const c = await loadContent(); const items = Array.isArray(c.packages) ? c.packages : [];
      $("packages-count").textContent = "(" + items.length + ")";
      if (!items.length) { list.innerHTML = '<div class="empty">Belum ada paket.</div>'; return; }
      list.innerHTML = items.map((p) => {
        let features = [];
        try { features = JSON.parse(p.features || "[]"); if (!Array.isArray(features)) features = []; } catch { features = []; }
        return '<div class="item"><div class="body"><div class="item-header"><div class="item-title">' + ESC(p.name) + ' <span class="badge green">' + fmtIDR(p.price) + '</span></div><div class="actions"><button class="ghost" data-edit-packages="' + ESC(p.id) + '" type="button">Edit</button><button class="danger" data-del-packages="' + ESC(p.id) + '" type="button">Hapus</button></div></div><div class="item-meta">Durasi: ' + ESC(p.duration) + ' · ' + ESC(p.cleaners) + ' cleaner</div><div class="item-body">' + features.map(f => "• " + ESC(f)).join("\\n") + '</div></div></div>';
      }).join("");
      list.querySelectorAll("[data-edit-packages]").forEach((b) => b.addEventListener("click", () => editPackage(b.dataset.editPackages)));
      list.querySelectorAll("[data-del-packages]").forEach((b) => b.addEventListener("click", () => delPackage(b.dataset.delPackages)));
    } catch (e) { list.innerHTML = '<div class="empty">Gagal: ' + ESC(e.message) + '</div>'; }
  }
  function editPackage(id) {
    const p = (cachedContent.packages||[]).find(x => String(x.id) === String(id)); if (!p) return;
    let features = [];
    try { features = JSON.parse(p.features || "[]"); if (!Array.isArray(features)) features = []; } catch {}
    $("packages-id").value = p.id; $("packages-name").value = p.name||""; $("packages-price").value = p.price||0;
    $("packages-cleaners").value = p.cleaners||1; $("packages-duration").value = p.duration||"";
    $("packages-features").value = features.join("\\n");
    $("packages-form-title").textContent = "Edit Paket #" + p.id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function delPackage(id) {
    if (!confirm("Hapus paket ini?")) return;
    try { const c = await loadContent(); await saveContent({ ...c, packages: (c.packages||[]).filter(p => String(p.id) !== String(id)) }); toast("Paket dihapus","success"); loadPackages(); } catch(e){ toast(e.message,"error"); }
  }
  $("packages-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("packages-id").value.trim();
    const name = $("packages-name").value.trim();
    const price = Number($("packages-price").value)||0;
    const cleaners = Number($("packages-cleaners").value)||1;
    const duration = $("packages-duration").value.trim();
    const features = $("packages-features").value.split(/\\n+/).map(s => s.trim()).filter(Boolean);
    if (!name) return toast("Wajib isi nama","error");
    try {
      const c = await loadContent();
      const list = Array.isArray(c.packages) ? c.packages.slice() : [];
      const data = { name, price, cleaners, duration, features: JSON.stringify(features) };
      if (id) { const i = list.findIndex(p => String(p.id) === String(id)); if (i>=0) list[i] = { ...list[i], ...data }; }
      else { list.push({ id: Date.now(), ...data }); }
      await saveContent({ ...c, packages: list });
      toast(id ? "Paket diperbarui" : "Paket ditambahkan","success");
      resetForm("packages"); loadPackages();
    } catch(e){ toast(e.message,"error"); }
  });

  // ===== BLOG =====
  async function loadBlog() {
    const list = $("blog-list"); list.innerHTML = '<div class="empty">Memuat…</div>';
    try {
      const c = await loadContent(); const items = Array.isArray(c.blogPosts) ? c.blogPosts : [];
      $("blog-count").textContent = "(" + items.length + ")";
      if (!items.length) { list.innerHTML = '<div class="empty">Belum ada artikel.</div>'; return; }
      list.innerHTML = items.map((b) => {
        const thumbStyle = b.imageUrl ? ' style="background-image:url(\\'' + ESC(b.imageUrl).replace(/'/g,"\\\\'") + '\\')"' : "";
        return '<div class="item"><div class="thumb"' + thumbStyle + '></div><div class="body"><div class="item-header"><div class="item-title">' + ESC(b.title) + '</div><div class="actions"><button class="ghost" data-edit-blog="' + ESC(b.id) + '" type="button">Edit</button><button class="danger" data-del-blog="' + ESC(b.id) + '" type="button">Hapus</button></div></div><div class="item-meta">' + ESC(b.category) + ' · ' + ESC(b.slug) + ' · ' + ESC((b.createdAt||"").slice(0,10)) + '</div><div class="item-body">' + ESC(b.excerpt) + '</div></div></div>';
      }).join("");
      list.querySelectorAll("[data-edit-blog]").forEach((b) => b.addEventListener("click", () => editBlog(b.dataset.editBlog)));
      list.querySelectorAll("[data-del-blog]").forEach((b) => b.addEventListener("click", () => delBlog(b.dataset.delBlog)));
    } catch (e) { list.innerHTML = '<div class="empty">Gagal: ' + ESC(e.message) + '</div>'; }
  }
  function editBlog(id) {
    const b = (cachedContent.blogPosts||[]).find(x => String(x.id) === String(id)); if (!b) return;
    $("blog-id").value = b.id; $("blog-title").value = b.title||""; $("blog-slug").value = b.slug||"";
    $("blog-category").value = b.category||""; $("blog-excerpt").value = b.excerpt||""; $("blog-content").value = b.content||"";
    $("blog-image-url").value = b.imageUrl||"";
    if (b.imageUrl) { $("blog-image-preview").src = b.imageUrl; $("blog-image-preview").classList.remove("hidden"); }
    else { $("blog-image-preview").classList.add("hidden"); }
    $("blog-form-title").textContent = "Edit Artikel #" + b.id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function delBlog(id) {
    if (!confirm("Hapus artikel ini?")) return;
    try { const c = await loadContent(); await saveContent({ ...c, blogPosts: (c.blogPosts||[]).filter(p => String(p.id) !== String(id)) }); toast("Artikel dihapus","success"); loadBlog(); } catch(e){ toast(e.message,"error"); }
  }
  $("blog-image-file").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const url = await fileToDataUrl(f, 500*1024); $("blog-image-url").value = url; $("blog-image-preview").src = url; $("blog-image-preview").classList.remove("hidden"); } catch(err){ toast(err.message,"error"); }
  });
  $("blog-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("blog-id").value.trim();
    const title = $("blog-title").value.trim();
    const slug = ($("blog-slug").value.trim() || slugify(title));
    const category = $("blog-category").value.trim();
    const excerpt = $("blog-excerpt").value.trim();
    const content = $("blog-content").value;
    const imageUrl = $("blog-image-url").value;
    if (!title) return toast("Wajib isi judul","error");
    try {
      const c = await loadContent();
      const list = Array.isArray(c.blogPosts) ? c.blogPosts.slice() : [];
      const data = { title, slug, category, excerpt, content, imageUrl };
      if (id) { const i = list.findIndex(p => String(p.id) === String(id)); if (i>=0) list[i] = { ...list[i], ...data }; }
      else { list.push({ id: Date.now(), createdAt: new Date().toISOString(), ...data }); }
      await saveContent({ ...c, blogPosts: list });
      toast(id ? "Artikel diperbarui" : "Artikel ditambahkan","success");
      resetForm("blog"); loadBlog();
    } catch(e){ toast(e.message,"error"); }
  });

  // ===== PORTFOLIO =====
  async function loadPortfolio() {
    const list = $("portfolio-list"); list.innerHTML = '<div class="empty">Memuat…</div>';
    try {
      const c = await loadContent(); const items = Array.isArray(c.portfolio) ? c.portfolio : [];
      $("portfolio-count").textContent = "(" + items.length + ")";
      if (!items.length) { list.innerHTML = '<div class="empty">Belum ada portfolio.</div>'; return; }
      list.innerHTML = items.map((p) => {
        const thumbStyle = p.imageUrl ? ' style="background-image:url(\\'' + ESC(p.imageUrl).replace(/'/g,"\\\\'") + '\\')"' : "";
        return '<div class="item"><div class="thumb"' + thumbStyle + '></div><div class="body"><div class="item-header"><div class="item-title">' + ESC(p.title) + '</div><div class="actions"><button class="ghost" data-edit-portfolio="' + ESC(p.id) + '" type="button">Edit</button><button class="danger" data-del-portfolio="' + ESC(p.id) + '" type="button">Hapus</button></div></div><div class="item-body">' + ESC(p.description) + '</div></div></div>';
      }).join("");
      list.querySelectorAll("[data-edit-portfolio]").forEach((b) => b.addEventListener("click", () => editPortfolio(b.dataset.editPortfolio)));
      list.querySelectorAll("[data-del-portfolio]").forEach((b) => b.addEventListener("click", () => delPortfolio(b.dataset.delPortfolio)));
    } catch (e) { list.innerHTML = '<div class="empty">Gagal: ' + ESC(e.message) + '</div>'; }
  }
  function editPortfolio(id) {
    const p = (cachedContent.portfolio||[]).find(x => String(x.id) === String(id)); if (!p) return;
    $("portfolio-id").value = p.id; $("portfolio-title").value = p.title||""; $("portfolio-description").value = p.description||"";
    $("portfolio-image-url").value = p.imageUrl||"";
    if (p.imageUrl) { $("portfolio-image-preview").src = p.imageUrl; $("portfolio-image-preview").classList.remove("hidden"); }
    else { $("portfolio-image-preview").classList.add("hidden"); }
    $("portfolio-form-title").textContent = "Edit Portfolio #" + p.id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function delPortfolio(id) {
    if (!confirm("Hapus portfolio ini?")) return;
    try { const c = await loadContent(); await saveContent({ ...c, portfolio: (c.portfolio||[]).filter(p => String(p.id) !== String(id)) }); toast("Portfolio dihapus","success"); loadPortfolio(); } catch(e){ toast(e.message,"error"); }
  }
  $("portfolio-image-file").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const url = await fileToDataUrl(f, 500*1024); $("portfolio-image-url").value = url; $("portfolio-image-preview").src = url; $("portfolio-image-preview").classList.remove("hidden"); } catch(err){ toast(err.message,"error"); }
  });
  $("portfolio-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("portfolio-id").value.trim();
    const title = $("portfolio-title").value.trim();
    const description = $("portfolio-description").value.trim();
    const imageUrl = $("portfolio-image-url").value;
    if (!title) return toast("Wajib isi judul","error");
    try {
      const c = await loadContent();
      const list = Array.isArray(c.portfolio) ? c.portfolio.slice() : [];
      const data = { title, description, imageUrl };
      if (id) { const i = list.findIndex(p => String(p.id) === String(id)); if (i>=0) list[i] = { ...list[i], ...data }; }
      else { list.push({ id: Date.now(), ...data }); }
      await saveContent({ ...c, portfolio: list });
      toast(id ? "Portfolio diperbarui" : "Portfolio ditambahkan","success");
      resetForm("portfolio"); loadPortfolio();
    } catch(e){ toast(e.message,"error"); }
  });

  // ===== BOOKINGS =====
  let cachedBookings = [];

  function lookupPackage(packageId) {
    return (cachedContent && cachedContent.packages || []).find(p => Number(p.id) === Number(packageId));
  }
  function waLinkFor(phone) {
    const wa = String(phone || "").replace(/\\D/g, "");
    if (!wa) return "";
    return "https://wa.me/" + (wa.startsWith("0") ? "62" + wa.slice(1) : wa);
  }
  function mapsLinkFor(b) {
    if (b.mapsUrl) return b.mapsUrl;
    if (Number.isFinite(b.latitude) && Number.isFinite(b.longitude)) return "https://www.google.com/maps?q=" + b.latitude + "," + b.longitude;
    if (b.address) return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(b.address);
    return "";
  }

  async function loadBookings() {
    const list = $("booking-list"); list.innerHTML = '<div class="empty">Memuat…</div>';
    try {
      await loadContent();
      if (!cachedSettings) { try { await loadSettings(); } catch (e) {} }
      const r = await api("/api/trpc/bookings.list");
      cachedBookings = (r.result && r.result.data && r.result.data.json) || [];
      renderBookings();
    } catch (e) { list.innerHTML = '<div class="empty">Gagal: ' + ESC(e.message) + '</div>'; }
  }
  function renderBookings() {
    const list = $("booking-list");
    const filter = $("booking-filter").value;
    const filtered = filter ? cachedBookings.filter(b => b.status === filter) : cachedBookings;
    $("booking-count").textContent = "(" + filtered.length + (filter ? " dari " + cachedBookings.length : "") + ")";
    if (!filtered.length) { list.innerHTML = '<div class="empty">Tidak ada booking.</div>'; return; }
    list.innerHTML = filtered.map((b) => {
      const date = b.date ? new Date(b.date).toLocaleString("id-ID") : "—";
      const pkg = lookupPackage(b.packageId);
      const statusClass = { pending:"amber", confirmed:"green", completed:"green", cancelled:"red" }[b.status] || "";
      return '<div class="item clickable" data-open-booking="' + ESC(b.id) + '"><div class="body"><div class="item-header"><div class="item-title">#' + ESC(b.id) + ' · ' + ESC(b.name || "(tanpa nama)") + ' <span class="badge ' + statusClass + '">' + ESC(b.status) + '</span></div><div style="font-size:.8rem;color:#6b7280">' + date + '</div></div><div class="item-meta">' + ESC(pkg ? pkg.name : "Paket #" + b.packageId) + (b.phone ? ' · ' + ESC(b.phone) : '') + '</div>' + (b.notes ? '<div class="item-body">' + ESC(b.notes.slice(0,120)) + (b.notes.length > 120 ? "…" : "") + '</div>' : '') + '</div></div>';
    }).join("");
    list.querySelectorAll("[data-open-booking]").forEach(el => el.addEventListener("click", () => openBookingDetail(el.dataset.openBooking)));
  }
  $("booking-filter").addEventListener("change", renderBookings);
  $("booking-refresh").addEventListener("click", loadBookings);
  $("booking-export").addEventListener("click", exportBookings);

  function openBookingDetail(id) {
    const b = cachedBookings.find(x => String(x.id) === String(id));
    if (!b) return;
    const pkg = lookupPackage(b.packageId);
    const wa = waLinkFor(b.phone);
    const maps = mapsLinkFor(b);
    const statusClass = { pending:"amber", confirmed:"green", completed:"green", cancelled:"red" }[b.status] || "";
    const fields = [
      ["Nama", ESC(b.name) || '<span class="hint">—</span>'],
      ["Telepon", b.phone ? ESC(b.phone) + (wa ? ' · <a href="' + wa + '" target="_blank">Hubungi WA</a>' : '') : '<span class="hint">—</span>'],
      ["Email", b.email ? ESC(b.email) : '<span class="hint">—</span>'],
      ["Alamat", b.address ? ESC(b.address) + (maps ? ' · <a href="' + maps + '" target="_blank">Arahkan ke Lokasi</a>' : '') : '<span class="hint">—</span>'],
      ["Paket", pkg ? ESC(pkg.name) + ' · ' + fmtIDR(pkg.price) : 'Paket #' + ESC(b.packageId)],
      ["Tanggal Layanan", b.date ? new Date(b.date).toLocaleString("id-ID") : '—'],
      ["Dibuat", b.createdAt ? new Date(b.createdAt).toLocaleString("id-ID") : '—'],
      ["Catatan", b.notes ? ESC(b.notes) : '<span class="hint">(tidak ada)</span>']
    ];
    $("modal-title").innerHTML = 'Booking #' + ESC(b.id) + ' <span class="badge ' + statusClass + '">' + ESC(b.status) + '</span>';
    $("modal-body").innerHTML = fields.map(([k,v]) => '<div class="field"><div class="field-label">' + k + '</div><div class="field-value">' + v + '</div></div>').join("") +
      '<div class="section-title">Update Status</div>' +
      '<select id="modal-status"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>';
    $("modal-status").value = b.status || "pending";
    $("modal-foot").innerHTML =
      '<button class="danger" id="modal-delete" type="button">Hapus</button>' +
      '<button class="ghost" id="modal-update" type="button">Update Status</button>' +
      (wa ? '<a class="ghost" href="' + wa + '" target="_blank" style="text-decoration:none;display:inline-block">Hubungi WA</a>' : '') +
      (maps ? '<a class="ghost" href="' + maps + '" target="_blank" style="text-decoration:none;display:inline-block">Lihat Maps</a>' : '') +
      '<button class="primary" id="modal-invoice" type="button">Cetak Invoice</button>';
    $("modal-delete").addEventListener("click", () => deleteBooking(b.id));
    $("modal-update").addEventListener("click", () => updateBookingStatus(b.id, $("modal-status").value));
    $("modal-invoice").addEventListener("click", () => printInvoice(b));
    openModal();
  }

  async function updateBookingStatus(id, status) {
    try {
      const c = await loadContent();
      const list = (c.bookings || []).map(b => Number(b.id) === Number(id) ? { ...b, status } : b);
      await saveContent({ ...c, bookings: list });
      toast("Status diperbarui", "success");
      closeModal();
      loadBookings();
    } catch (e) { toast(e.message, "error"); }
  }
  async function deleteBooking(id) {
    if (!confirm("Hapus booking ini? Aksi tidak bisa dibatalkan.")) return;
    try {
      const c = await loadContent();
      const list = (c.bookings || []).filter(b => Number(b.id) !== Number(id));
      await saveContent({ ...c, bookings: list });
      toast("Booking dihapus", "success");
      closeModal();
      loadBookings();
    } catch (e) { toast(e.message, "error"); }
  }

  async function printInvoice(b) {
    if (!cachedSettings) {
      try { await loadSettings(); } catch (e) { /* fall through with empty settings */ }
    }
    const s = cachedSettings || {};
    const pkg = lookupPackage(b.packageId);
    const total = fmtIDR(pkg ? pkg.price : 0);
    const maps = mapsLinkFor(b);
    const primaryColor = s.primaryColor || "#00A499";
    const html = '<!doctype html><html><head><meta charset="UTF-8"/><title>Invoice ' + ESC(s.brandName || "") + ' - #' + ESC(b.id) + '</title><style>' +
      'body{font-family:Arial,sans-serif;color:#0f172a;margin:0;padding:40px}' +
      '.header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #e2e8f0;padding-bottom:24px;margin-bottom:28px}' +
      '.brand{display:flex;gap:14px;align-items:center}' +
      '.brand img{width:56px;height:56px;object-fit:cover;border-radius:8px}' +
      'h1,h2,h3,p{margin:0}h1{font-size:28px}' +
      '.muted{color:#64748b;margin-top:6px;font-size:14px}' +
      '.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}' +
      '.box{border:1px solid #e2e8f0;border-radius:8px;padding:18px}' +
      '.box h3{font-size:13px;color:#334155;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em}' +
      '.row{display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding:12px 0}' +
      '.row:last-child{border-bottom:0}' +
      '.total{font-size:22px;font-weight:700;color:' + primaryColor + '}' +
      '.status{display:inline-block;padding:6px 12px;border-radius:999px;background:#dcfce7;color:#166534;font-weight:700;text-transform:uppercase;font-size:12px}' +
      '.print-btn{position:fixed;top:10px;right:10px;padding:8px 16px;background:' + primaryColor + ';color:#fff;border:none;border-radius:6px;cursor:pointer}' +
      '@media print{body{padding:24px}.print-btn{display:none}}' +
      '</style></head><body>' +
      '<button class="print-btn" onclick="window.print()">Cetak / Print</button>' +
      '<div class="header"><div class="brand">' + (s.logoUrl ? '<img src="' + ESC(s.logoUrl) + '" alt="Logo"/>' : '') + '<div><h1>' + ESC(s.brandName || "Meng-Cleaning") + '</h1><p class="muted">' + ESC(s.email || "") + (s.whatsapp ? ' · ' + ESC(s.whatsapp) : '') + '</p></div></div>' +
      '<div style="text-align:right"><h2>INVOICE</h2><p class="muted">INV-' + ESC(b.id) + '</p><p class="muted">' + new Date().toLocaleDateString("id-ID") + '</p></div></div>' +
      '<div class="grid">' +
      '<div class="box"><h3>Customer</h3><p class="muted"><strong>' + ESC(b.name || "(tanpa nama)") + '</strong></p>' + (b.email ? '<p class="muted">' + ESC(b.email) + '</p>' : '') + (b.phone ? '<p class="muted">' + ESC(b.phone) + '</p>' : '') + (b.address ? '<p class="muted">' + ESC(b.address) + '</p>' : '') + (maps ? '<p class="muted"><a href="' + ESC(maps) + '" target="_blank">' + ESC(maps) + '</a></p>' : '') + '</div>' +
      '<div class="box"><h3>Layanan</h3><p class="muted"><strong>' + ESC(pkg ? pkg.name : "Paket #" + b.packageId) + '</strong></p>' + (pkg && pkg.duration ? '<p class="muted">Durasi: ' + ESC(pkg.duration) + '</p>' : '') + '<p class="muted">Tanggal: ' + new Date(b.date || b.createdAt || Date.now()).toLocaleDateString("id-ID") + '</p><p class="muted">Status: <span class="status">' + ESC(b.status || "pending") + '</span></p></div>' +
      '</div>' +
      '<div class="box">' +
      '<div class="row"><div>' + ESC(pkg ? pkg.name : "Paket #" + b.packageId) + '</div><div>' + total + '</div></div>' +
      '<div class="row"><div><strong>Total</strong></div><div class="total">' + total + '</div></div>' +
      '</div>' +
      (b.notes ? '<div class="box" style="margin-top:24px"><h3>Catatan</h3><p class="muted">' + ESC(b.notes) + '</p></div>' : '') +
      '<p class="muted" style="margin-top:32px;text-align:center">Terima kasih telah memilih ' + ESC(s.brandName || "kami") + '.</p>' +
      '</body></html>';
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) { toast("Popup invoice diblokir browser. Aktifkan popup untuk situs ini.", "error"); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }

  function exportBookings() {
    if (!cachedBookings.length) { toast("Belum ada booking untuk diexport.", "error"); return; }
    const headers = ["ID","Nama","Email","WhatsApp","Alamat","Maps","Paket","Tanggal","Status","Catatan","Total"];
    const rows = cachedBookings.map(b => {
      const pkg = lookupPackage(b.packageId);
      return [b.id, b.name||"", b.email||"", b.phone||"", b.address||"", mapsLinkFor(b)||"", pkg ? pkg.name : "Paket #" + b.packageId, b.date ? new Date(b.date).toLocaleDateString("id-ID") : "", b.status||"pending", b.notes||"", fmtIDR(pkg?pkg.price:0)];
    });
    const html = '<!doctype html><html><head><meta charset="UTF-8"/></head><body><table border="1">' +
      [headers, ...rows].map(r => '<tr>' + r.map(c => '<td>' + ESC(c) + '</td>').join("") + '</tr>').join("") + '</table></body></html>';
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pemesanan-" + new Date().toISOString().slice(0,10) + ".xls"; a.click();
    URL.revokeObjectURL(url);
    toast("File Excel diunduh", "success");
  }

  // ===== MODAL =====
  function openModal() { $("modal").classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeModal() { $("modal").classList.remove("open"); document.body.style.overflow = ""; }
  $("modal-close").addEventListener("click", closeModal);
  $("modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // ===== ADMIN MANAGEMENT =====
  async function loadAdmins() {
    const list = $("admins-list"); list.innerHTML = '<div class="empty">Memuat…</div>';
    try {
      const c = await loadContent();
      const items = Array.isArray(c.adminAccounts) ? c.adminAccounts : [];
      $("admins-count").textContent = "(" + items.length + ")";
      if (!items.length) { list.innerHTML = '<div class="empty">Belum ada admin.</div>'; return; }
      list.innerHTML = items.map((a) => '<div class="item"><div class="body"><div class="item-header"><div class="item-title">' + ESC(a.username) + ' <span class="badge">' + (a.hasPassword ? 'aktif' : 'tanpa password') + '</span></div><div class="actions"><button class="ghost" data-edit-admins="' + ESC(a.id) + '" type="button">Ganti Password</button><button class="danger" data-del-admins="' + ESC(a.id) + '" type="button">Hapus</button></div></div><div class="item-meta">' + ESC(a.id) + '</div></div></div>').join("");
      list.querySelectorAll("[data-edit-admins]").forEach((b) => b.addEventListener("click", () => editAdmin(b.dataset.editAdmins)));
      list.querySelectorAll("[data-del-admins]").forEach((b) => b.addEventListener("click", () => delAdmin(b.dataset.delAdmins)));
    } catch (e) { list.innerHTML = '<div class="empty">Gagal: ' + ESC(e.message) + '</div>'; }
  }
  function editAdmin(id) {
    const a = (cachedContent.adminAccounts||[]).find(x => String(x.id) === String(id)); if (!a) return;
    $("admins-id").value = a.id; $("admins-username").value = a.username||""; $("admins-password").value = "";
    $("admins-form-title").textContent = "Edit Admin: " + a.username;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function delAdmin(id) {
    if (!confirm("Hapus akun admin ini?")) return;
    try { const c = await loadContent(); await saveContent({ ...c, adminAccounts: (c.adminAccounts||[]).filter(a => String(a.id) !== String(id)) }); toast("Admin dihapus","success"); loadAdmins(); } catch(e){ toast(e.message,"error"); }
  }
  async function hashPasswordClient(plain) {
    // Use Web Crypto to derive a key via PBKDF2 then format like scrypt$ … no, we need scrypt match server.
    // Browser can't do scrypt easily without lib. Send plain to server endpoint to hash, or store plain
    // temporarily and let server hash on next read. Simpler: keep plain in blob — verifyPassword on
    // server will reject (only scrypt$). So we POST to a small hash endpoint? Not implemented yet.
    // Workaround: hash on server-side via a dedicated endpoint we add.
    const r = await api("/api/admin-hash", { method: "POST", body: JSON.stringify({ password: plain }) });
    return r.hash;
  }
  $("admins-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("admins-id").value.trim();
    const username = $("admins-username").value.trim();
    const password = $("admins-password").value;
    if (!username) return toast("Username wajib diisi", "error");
    if (!id && !password) return toast("Password wajib diisi untuk admin baru", "error");
    try {
      const c = await loadContent();
      const list = Array.isArray(c.adminAccounts) ? c.adminAccounts.slice() : [];
      let hashedPassword = "";
      if (password) {
        hashedPassword = await hashPasswordClient(password);
      }
      if (id) {
        const i = list.findIndex(a => String(a.id) === String(id));
        if (i >= 0) list[i] = { ...list[i], username, ...(hashedPassword ? { password: hashedPassword } : {}) };
      } else {
        list.push({ id: "admin-" + Date.now(), username, password: hashedPassword });
      }
      await saveContent({ ...c, adminAccounts: list });
      toast(id ? "Admin diperbarui" : "Admin ditambahkan", "success");
      resetForm("admins"); loadAdmins();
    } catch(e){ toast(e.message, "error"); }
  });

  // ===== SETTINGS =====
  async function loadSettingsForm() {
    try {
      const s = await loadSettings();
      ["brandName","heroTitle","heroSubtitle","email","whatsapp","orderWhatsapp","orderWhatsappLabel","facebook","instagram","linkedin"].forEach(k => { const el = $("settings-" + k); if (el) el.value = s[k] || ""; });
      $("settings-primaryColor").value = s.primaryColor || "#00A499";
      $("settings-heroBackgroundFit").value = s.heroBackgroundFit || "cover";
      const imgFields = [["logoUrl","logoPreview"],["dashboardBackgroundUrl","dashboardBackgroundPreview"],["heroBackgroundUrl","heroBackgroundPreview"]];
      imgFields.forEach(([urlKey, prevKey]) => {
        const url = s[urlKey] || "";
        $("settings-" + urlKey).value = url;
        const prev = $("settings-" + prevKey);
        if (url) { prev.src = url; prev.classList.remove("hidden"); } else { prev.classList.add("hidden"); }
      });
    } catch (e) { toast("Gagal memuat settings: " + e.message, "error"); }
  }
  ["logo","dashboardBackground","heroBackground"].forEach((kind) => {
    $("settings-" + kind + "File").addEventListener("change", async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { const url = await fileToDataUrl(f, 500*1024); $("settings-" + kind + "Url").value = url; $("settings-" + kind + "Preview").src = url; $("settings-" + kind + "Preview").classList.remove("hidden"); } catch(err){ toast(err.message,"error"); }
    });
  });
  $("settings-reload").addEventListener("click", loadSettingsForm);
  $("settings-reset").addEventListener("click", async () => {
    if (!confirm("Reset SEMUA pengaturan ke default? (logo, hero, warna, kontak, sosmed)")) return;
    try {
      const r = await fetch("/api/site-settings", {
        method: "DELETE",
        headers: { "content-type": "application/json", authorization: "Bearer " + token() },
        body: JSON.stringify({ auth: { token: token() } })
      });
      if (!r.ok) { const d = await r.json().catch(()=>({})); throw new Error(d.error || "HTTP " + r.status); }
      toast("Pengaturan direset ke default", "success"); loadSettingsForm();
    } catch (e) { toast(e.message, "error"); }
  });
  $("settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const settings = {};
    ["brandName","heroTitle","heroSubtitle","email","whatsapp","orderWhatsapp","orderWhatsappLabel","facebook","instagram","linkedin","logoUrl","dashboardBackgroundUrl","heroBackgroundUrl","primaryColor"].forEach(k => { settings[k] = $("settings-" + k).value; });
    settings.heroBackgroundFit = $("settings-heroBackgroundFit").value;
    try { await saveSettings(settings); toast("Pengaturan tersimpan","success"); loadSettingsForm(); } catch(e){ toast("Gagal: " + e.message,"error"); }
  });

  // ===== INIT =====
  function checkAuth() {
    if (!token()) { show("login"); return; }
    show("app");
    $("user-label").textContent = sessionStorage.getItem(USER_KEY) || "admin";
    switchTab("faq");
  }
  checkAuth();
})();
</script>
</body>
</html>
`;

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, HTML, "utf-8");
console.log(`Admin panel ditulis: ${OUT} (${HTML.length} bytes)`);
