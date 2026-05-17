import { readRequestBody, sendJson, verifyAdminCredentials } from "./_shared/data.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
  try {
    const body = await readRequestBody(req);
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    if (!username || !password) {
      return sendJson(res, 400, { error: "Username dan password wajib diisi." });
    }
    const ok = await verifyAdminCredentials(username, password);
    if (!ok) {
      await new Promise((r) => setTimeout(r, 250));
      return sendJson(res, 401, { error: "Kredensial tidak valid." });
    }
    const token = process.env.CLEANAPP_SETTINGS_TOKEN;
    if (!token) {
      return sendJson(res, 500, { error: "Server belum dikonfigurasi: set CLEANAPP_SETTINGS_TOKEN di Vercel env." });
    }
    return sendJson(res, 200, { token, tokenType: "Bearer", expiresIn: 60 * 60 * 8 });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message || "Internal error" });
  }
}
