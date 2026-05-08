import { appendPublicBooking, readRequestBody, sendJson } from "./_shared/data.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
  const body = await readRequestBody(req);
  sendJson(res, 200, await appendPublicBooking(body.booking ?? body));
}
