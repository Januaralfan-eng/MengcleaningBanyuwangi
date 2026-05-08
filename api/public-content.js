import { canWrite, readPublicContent, readRequestBody, savePublicContent, sendJson } from "./_shared/data.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return sendJson(res, 200, await readPublicContent());
  }

  if (req.method === "PUT") {
    const body = await readRequestBody(req);
    if (!canWrite(body.auth)) return sendJson(res, 401, { error: "Tidak punya izin menyimpan konten online." });
    return sendJson(res, 200, await savePublicContent(body.content ?? body));
  }

  sendJson(res, 405, { error: "Method not allowed" });
}
