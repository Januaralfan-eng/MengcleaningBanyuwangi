import { canWrite, readRequestBody, readSiteSettings, saveSiteSettings, sendJson } from "./_shared/data.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      return sendJson(res, 200, await readSiteSettings());
    }

    if (req.method === "PUT") {
      const body = await readRequestBody(req);
      if (!canWrite(body.auth)) return sendJson(res, 401, { error: "Tidak punya izin menyimpan pengaturan online." });
      return sendJson(res, 200, await saveSiteSettings(body.settings ?? body));
    }

    if (req.method === "DELETE") {
      const body = await readRequestBody(req);
      if (!canWrite(body.auth)) return sendJson(res, 401, { error: "Tidak punya izin menyimpan pengaturan online." });
      return sendJson(res, 200, await saveSiteSettings({}));
    }

    return sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message || "Internal error" });
  }
}
