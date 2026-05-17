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
  header{background:#00A499;color:#fff;padding:1rem 1.25rem;display:flex;justify-content:space-between;align-items:center;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  header h1{margin:0;font-size:1.125rem;font-weight:600}
  header button{background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3);padding:.4rem .75rem;border-radius:.375rem;cursor:pointer;font-size:.875rem}
  header button:hover{background:rgba(255,255,255,.3)}
  main{max-width:880px;margin:0 auto;padding:1.25rem}
  .card{background:#fff;border:1px solid #e5e7eb;border-radius:.5rem;padding:1.25rem;margin-bottom:1rem;box-shadow:0 1px 2px rgba(0,0,0,.04)}
  h2{margin:0 0 .75rem;font-size:1rem;font-weight:600;color:#111827}
  label{display:block;font-size:.85rem;font-weight:500;margin-bottom:.25rem;color:#374151}
  input,textarea,select{width:100%;padding:.5rem .65rem;border:1px solid #d1d5db;border-radius:.375rem;font-size:.9rem;font-family:inherit;background:#fff}
  input:focus,textarea:focus{outline:2px solid #00A499;outline-offset:-1px;border-color:#00A499}
  textarea{min-height:80px;resize:vertical}
  .row{margin-bottom:.75rem}
  .actions{display:flex;gap:.5rem;flex-wrap:wrap}
  button.primary{background:#00A499;color:#fff;border:none;padding:.55rem 1rem;border-radius:.375rem;cursor:pointer;font-size:.9rem;font-weight:500}
  button.primary:hover{background:#008c83}
  button.primary:disabled{background:#9ca3af;cursor:not-allowed}
  button.ghost{background:#fff;color:#374151;border:1px solid #d1d5db;padding:.5rem .85rem;border-radius:.375rem;cursor:pointer;font-size:.85rem}
  button.ghost:hover{background:#f3f4f6}
  button.danger{background:#fff;color:#dc2626;border:1px solid #fecaca;padding:.4rem .65rem;border-radius:.375rem;cursor:pointer;font-size:.8rem}
  button.danger:hover{background:#fef2f2}
  .tabs{display:flex;gap:.25rem;flex-wrap:wrap;margin-bottom:1rem;border-bottom:1px solid #e5e7eb}
  .tab{padding:.5rem 1rem;border:none;background:none;cursor:pointer;font-size:.9rem;color:#6b7280;border-bottom:2px solid transparent;margin-bottom:-1px;font-family:inherit}
  .tab.active{color:#00A499;border-bottom-color:#00A499;font-weight:600}
  .tab:hover:not(.active){color:#374151}
  .panel{display:none}
  .panel.active{display:block}
  .item{padding:.85rem;border:1px solid #e5e7eb;border-radius:.375rem;margin-bottom:.5rem;background:#fafbfc}
  .item-header{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem;margin-bottom:.35rem}
  .item-title{font-weight:600;color:#111827;flex:1}
  .item-body{font-size:.875rem;color:#4b5563;white-space:pre-wrap}
  .empty{padding:2rem;text-align:center;color:#9ca3af;font-size:.9rem}
  .toast{position:fixed;bottom:1rem;right:1rem;background:#111827;color:#fff;padding:.6rem 1rem;border-radius:.375rem;font-size:.875rem;box-shadow:0 4px 12px rgba(0,0,0,.15);opacity:0;transition:opacity .2s;pointer-events:none;z-index:50;max-width:320px}
  .toast.show{opacity:1}
  .toast.error{background:#dc2626}
  .toast.success{background:#059669}
  .placeholder{padding:1.5rem;text-align:center;color:#6b7280;background:#f9fafb;border-radius:.375rem;font-size:.9rem}
  #login{max-width:380px;margin:4rem auto;padding:1.5rem}
  #login h2{font-size:1.25rem;margin-bottom:1rem;text-align:center}
  .hidden{display:none!important}
  .hint{font-size:.8rem;color:#6b7280;margin-top:.25rem}
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
    <h1>Meng-Cleaning Banyuwangi · Admin</h1>
    <button id="logout-btn" type="button">Logout</button>
  </header>
  <main>
    <div class="tabs" id="tabs">
      <button class="tab active" data-tab="faq" type="button">FAQ</button>
      <button class="tab" data-tab="services" type="button">Layanan</button>
      <button class="tab" data-tab="packages" type="button">Paket</button>
      <button class="tab" data-tab="blog" type="button">Blog</button>
      <button class="tab" data-tab="portfolio" type="button">Portfolio</button>
      <button class="tab" data-tab="bookings" type="button">Booking</button>
    </div>

    <div id="panel-faq" class="panel active">
      <div class="card">
        <h2 id="faq-form-title">Tambah FAQ</h2>
        <form id="faq-form">
          <input type="hidden" id="faq-id" />
          <div class="row">
            <label for="faq-question">Pertanyaan</label>
            <input id="faq-question" required maxlength="300" />
          </div>
          <div class="row">
            <label for="faq-answer">Jawaban</label>
            <textarea id="faq-answer" required maxlength="2000"></textarea>
          </div>
          <div class="actions">
            <button class="primary" type="submit" id="faq-submit-btn">Simpan</button>
            <button class="ghost" type="button" id="faq-reset-btn">Reset</button>
          </div>
        </form>
      </div>
      <div class="card">
        <h2>Daftar FAQ <span id="faq-count" style="font-weight:400;color:#6b7280;font-size:.875rem"></span></h2>
        <div id="faq-list"><div class="empty">Memuat…</div></div>
      </div>
    </div>

    <div id="panel-services" class="panel"><div class="placeholder">Editor Layanan menyusul. Sementara, edit via API atau lewat form UI utama.</div></div>
    <div id="panel-packages" class="panel"><div class="placeholder">Editor Paket menyusul.</div></div>
    <div id="panel-blog" class="panel"><div class="placeholder">Editor Blog menyusul.</div></div>
    <div id="panel-portfolio" class="panel"><div class="placeholder">Editor Portfolio menyusul.</div></div>
    <div id="panel-bookings" class="panel">
      <div class="card">
        <h2>Booking Terbaru <span id="booking-count" style="font-weight:400;color:#6b7280;font-size:.875rem"></span></h2>
        <div id="booking-list"><div class="empty">Memuat…</div></div>
      </div>
    </div>
  </main>
</div>

<div id="toast" class="toast"></div>

<script>
(function(){
  const TOKEN_KEY = "cleanapp-admin-token-v1";
  const $ = (id) => document.getElementById(id);

  function token() { return sessionStorage.getItem(TOKEN_KEY); }
  function setToken(t) { if (t) sessionStorage.setItem(TOKEN_KEY, t); else sessionStorage.removeItem(TOKEN_KEY); }

  function toast(msg, type) {
    const el = $("toast");
    el.textContent = msg;
    el.className = "toast show " + (type || "");
    setTimeout(() => { el.className = "toast"; }, 2600);
  }

  async function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ "content-type": "application/json" }, opts.headers || {});
    const t = token();
    if (t) opts.headers.authorization = "Bearer " + t;
    const r = await fetch(path, opts);
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (data && (data.error || (data.error && data.error.message))) || ("HTTP " + r.status);
      throw new Error(msg);
    }
    return data;
  }

  function show(view) {
    $("login").classList.toggle("hidden", view !== "login");
    $("app").classList.toggle("hidden", view !== "app");
  }

  async function checkAuth() {
    if (!token()) { show("login"); return; }
    try {
      const r = await api("/api/public-content");
      const c = r.content || {};
      const hasSecrets = Array.isArray(c.bookings) && c.bookings.some(b => b && (b.name || b.phone || b.email));
      if (!hasSecrets) {
        const fresh = (c.adminAccounts || []).some(a => a.password);
        if (!fresh) { setToken(null); show("login"); return; }
      }
      show("app");
      loadFaqs();
      loadBookings();
    } catch (e) {
      setToken(null);
      show("login");
    }
  }

  $("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("login-btn");
    btn.disabled = true; btn.textContent = "Memeriksa…";
    try {
      const r = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: $("login-username").value.trim(), password: $("login-password").value })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Login gagal");
      setToken(data.token);
      $("login-password").value = "";
      toast("Login berhasil", "success");
      show("app");
      loadFaqs();
      loadBookings();
    } catch (err) {
      toast(err.message || "Login gagal", "error");
    } finally {
      btn.disabled = false; btn.textContent = "Masuk";
    }
  });

  $("logout-btn").addEventListener("click", () => {
    setToken(null);
    show("login");
    toast("Keluar dari admin");
  });

  document.querySelectorAll(".tab").forEach((t) => {
    t.addEventListener("click", () => {
      const name = t.dataset.tab;
      document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x === t));
      document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
      if (name === "bookings") loadBookings();
      if (name === "faq") loadFaqs();
    });
  });

  let cachedContent = null;

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

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]);
  }

  async function loadFaqs() {
    const list = $("faq-list");
    list.innerHTML = '<div class="empty">Memuat…</div>';
    try {
      const c = await loadContent();
      const faqs = Array.isArray(c.faqs) ? c.faqs : [];
      $("faq-count").textContent = "(" + faqs.length + ")";
      if (!faqs.length) { list.innerHTML = '<div class="empty">Belum ada FAQ.</div>'; return; }
      list.innerHTML = faqs.map((f) => '\
        <div class="item">\
          <div class="item-header">\
            <div class="item-title">' + escapeHtml(f.question) + '</div>\
            <div class="actions">\
              <button class="ghost" data-edit="' + escapeHtml(f.id) + '" type="button">Edit</button>\
              <button class="danger" data-del="' + escapeHtml(f.id) + '" type="button">Hapus</button>\
            </div>\
          </div>\
          <div class="item-body">' + escapeHtml(f.answer) + '</div>\
        </div>').join("");
      list.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editFaq(b.dataset.edit)));
      list.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => deleteFaq(b.dataset.del)));
    } catch (e) {
      list.innerHTML = '<div class="empty">Gagal: ' + escapeHtml(e.message) + '</div>';
    }
  }

  function resetFaqForm() {
    $("faq-id").value = "";
    $("faq-question").value = "";
    $("faq-answer").value = "";
    $("faq-form-title").textContent = "Tambah FAQ";
    $("faq-submit-btn").textContent = "Simpan";
  }

  function editFaq(id) {
    const c = cachedContent || {};
    const f = (c.faqs || []).find((x) => String(x.id) === String(id));
    if (!f) return;
    $("faq-id").value = f.id;
    $("faq-question").value = f.question || "";
    $("faq-answer").value = f.answer || "";
    $("faq-form-title").textContent = "Edit FAQ #" + f.id;
    $("faq-submit-btn").textContent = "Update";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteFaq(id) {
    if (!confirm("Hapus FAQ ini?")) return;
    try {
      const c = await loadContent();
      const next = Object.assign({}, c, { faqs: (c.faqs || []).filter((f) => String(f.id) !== String(id)) });
      await saveContent(next);
      toast("FAQ dihapus", "success");
      loadFaqs();
    } catch (e) {
      toast(e.message || "Gagal menghapus", "error");
    }
  }

  $("faq-reset-btn").addEventListener("click", resetFaqForm);

  $("faq-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("faq-id").value.trim();
    const question = $("faq-question").value.trim();
    const answer = $("faq-answer").value.trim();
    if (!question || !answer) { toast("Pertanyaan & jawaban wajib diisi", "error"); return; }
    const btn = $("faq-submit-btn");
    btn.disabled = true; const original = btn.textContent; btn.textContent = "Menyimpan…";
    try {
      const c = await loadContent();
      const existing = Array.isArray(c.faqs) ? c.faqs.slice() : [];
      if (id) {
        const idx = existing.findIndex((f) => String(f.id) === String(id));
        if (idx >= 0) existing[idx] = Object.assign({}, existing[idx], { question, answer });
      } else {
        const newId = Date.now();
        existing.push({ id: newId, question, answer });
      }
      const next = Object.assign({}, c, { faqs: existing });
      await saveContent(next);
      toast(id ? "FAQ diperbarui" : "FAQ ditambahkan", "success");
      resetFaqForm();
      loadFaqs();
    } catch (e) {
      toast(e.message || "Gagal menyimpan", "error");
    } finally {
      btn.disabled = false; btn.textContent = original;
    }
  });

  async function loadBookings() {
    const list = $("booking-list");
    list.innerHTML = '<div class="empty">Memuat…</div>';
    try {
      const r = await api("/api/trpc/bookings.list");
      const bookings = (r.result && r.result.data && r.result.data.json) || [];
      $("booking-count").textContent = "(" + bookings.length + ")";
      if (!bookings.length) { list.innerHTML = '<div class="empty">Belum ada booking.</div>'; return; }
      list.innerHTML = bookings.map((b) => {
        const date = b.date ? new Date(b.date).toLocaleString("id-ID") : "—";
        const wa = (b.phone || "").replace(/\\D/g, "");
        const waLink = wa ? '<a href="https://wa.me/' + (wa.startsWith("0") ? "62" + wa.slice(1) : wa) + '" target="_blank">WA</a>' : "";
        const mapsLink = b.mapsUrl ? '<a href="' + escapeHtml(b.mapsUrl) + '" target="_blank">Maps</a>' : "";
        return '\
          <div class="item">\
            <div class="item-header">\
              <div class="item-title">#' + escapeHtml(b.id) + ' · ' + escapeHtml(b.name || "(tanpa nama)") + '</div>\
              <div style="font-size:.8rem;color:#6b7280">' + date + '</div>\
            </div>\
            <div class="item-body">\
              <div>Paket ID: ' + escapeHtml(b.packageId) + ' · Status: ' + escapeHtml(b.status) + '</div>\
              ' + (b.phone ? '<div>Telp: ' + escapeHtml(b.phone) + ' ' + waLink + '</div>' : '') + '\
              ' + (b.email ? '<div>Email: ' + escapeHtml(b.email) + '</div>' : '') + '\
              ' + (b.address ? '<div>Alamat: ' + escapeHtml(b.address) + ' ' + mapsLink + '</div>' : '') + '\
              ' + (b.notes ? '<div>Catatan: ' + escapeHtml(b.notes) + '</div>' : '') + '\
            </div>\
          </div>';
      }).join("");
    } catch (e) {
      list.innerHTML = '<div class="empty">Gagal: ' + escapeHtml(e.message) + '</div>';
    }
  }

  checkAuth();
})();
</script>
</body>
</html>
`;

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, HTML, "utf-8");
console.log(`Admin panel ditulis: ${OUT}`);

