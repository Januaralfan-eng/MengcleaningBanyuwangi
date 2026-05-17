import { canWrite, isAdminRequest, readPublicContent, readRequestBody, savePublicContent, sendJson } from "./_shared/data.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const includeSecrets = isAdminRequest(req);
      return sendJson(res, 200, await readPublicContent({ includeSecrets }));
    }

    if (req.method === "PUT") {
      const body = await readRequestBody(req);
      if (!canWrite(body.auth)) return sendJson(res, 401, { error: "Tidak punya izin menyimpan konten online." });
      return sendJson(res, 200, await savePublicContent(body.content ?? body));
    }

    return sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message || "Internal error" });
  }
}
