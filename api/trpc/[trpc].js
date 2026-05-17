import {
  appendPublicBooking,
  isAdminRequest,
  isValidBookingInput,
  readPublicContent,
  readRequestBody,
  sendJson
} from "../_shared/data.js";

const MAX_BATCH = 24;

function trpcResult(data) {
  return { result: { data: { json: data } } };
}

function trpcError(path, message, code = "NOT_FOUND", status = 404) {
  return {
    error: {
      message,
      code: -32004,
      data: { code, httpStatus: status, path }
    }
  };
}

function parseInput(raw, index, batch) {
  if (raw === undefined || raw === null || raw === "") return undefined;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const value = batch ? parsed?.[index] : parsed;
    return value && typeof value === "object" && "json" in value ? value.json : value;
  } catch {
    return undefined;
  }
}

async function runProcedure(req, path, input) {
  const isAdmin = isAdminRequest(req);
  const { content } = await readPublicContent({ includeSecrets: isAdmin });

  switch (path) {
    case "services.list":
      return content.services;
    case "services.get":
      return content.services.find((item) => Number(item.id) === Number(input)) ?? null;
    case "packages.list":
      return content.packages;
    case "packages.get":
      return content.packages.find((item) => Number(item.id) === Number(input)) ?? null;
    case "blog.list":
      return content.blogPosts;
    case "blog.get":
      return content.blogPosts.find((item) => Number(item.id) === Number(input)) ?? null;
    case "blog.getBySlug":
      return content.blogPosts.find((item) => item.slug === input) ?? null;
    case "bookings.list":
      if (!isAdmin) return trpcError(path, "Akses ditolak", "FORBIDDEN", 403);
      return content.bookings;
    case "bookings.get":
      if (!isAdmin) return trpcError(path, "Akses ditolak", "FORBIDDEN", 403);
      return content.bookings.find((item) => Number(item.id) === Number(input)) ?? null;
    case "bookings.create": {
      if (!isValidBookingInput(input ?? {})) {
        return trpcError(path, "Data booking tidak lengkap", "BAD_REQUEST", 400);
      }
      const saved = await appendPublicBooking(input ?? {});
      return saved.content.bookings[0] ?? null;
    }
    case "auth.me":
      return isAdmin ? { username: process.env.ADMIN_USERNAME || "admin", isAdmin: true } : null;
    case "auth.logout":
      return { success: true };
    default:
      return trpcError(path, `No procedure found on path "${path}"`);
  }
}

export default async function handler(req, res) {
  try {
    const pathQuery = req.query?.trpc;
    const rawPath = Array.isArray(pathQuery) ? pathQuery.join("/") : String(pathQuery || "");
    const batch = req.query?.batch === "1";
    const paths = rawPath.split(",").filter(Boolean).slice(0, MAX_BATCH);
    const body = req.method === "GET" ? undefined : await readRequestBody(req);
    const rawInput = req.method === "GET" ? req.query?.input : body;

    const results = await Promise.all(
      paths.map(async (procedurePath, index) => {
        try {
          const result = await runProcedure(req, procedurePath, parseInput(rawInput, index, batch));
          return result?.error ? result : trpcResult(result);
        } catch (error) {
          return trpcError(procedurePath, error.message || "Internal error", "INTERNAL_SERVER_ERROR", 500);
        }
      })
    );

    return sendJson(res, 200, batch ? results : results[0] ?? trpcError(rawPath, "Missing procedure path"));
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message || "Internal error" });
  }
}
