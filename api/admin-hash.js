import { hashPassword, isAdminRequest, readRequestBody, sendJson } from "./_shared/data.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
  if (!isAdminRequest(req)) return sendJson(res, 401, { error: "Bearer admin token diperlukan." });
  try {
    const body = await readRequestBody(req);
    const password = String(body.password || "");
    if (!password) return sendJson(res, 400, { error: "Password kosong." });
    if (password.length > 200) return sendJson(res, 400, { error: "Password terlalu panjang." });
    return sendJson(res, 200, { hash: hashPassword(password) });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message || "Internal error" });
  }
}
