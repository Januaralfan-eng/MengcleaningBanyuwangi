import { appendPublicBooking, isValidBookingInput, readRequestBody, sendJson } from "./_shared/data.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
  try {
    const body = await readRequestBody(req);
    const payload = body.booking ?? body;
    if (!isValidBookingInput(payload)) {
      return sendJson(res, 400, { error: "Data booking tidak lengkap (butuh name dan packageId)." });
    }
    const saved = await appendPublicBooking(payload);
    return sendJson(res, 200, saved);
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message || "Internal error" });
  }
}
