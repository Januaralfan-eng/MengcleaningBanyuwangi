import { appendPublicBooking, readPublicContent, readRequestBody, sendJson } from "../_shared/data.js";

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
  if (!raw) return undefined;
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  const value = batch ? parsed?.[index] : parsed;
  return value && typeof value === "object" && "json" in value ? value.json : value;
}

async function runProcedure(path, input) {
  const { content } = await readPublicContent();

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
      return content.bookings;
    case "bookings.get":
      return content.bookings.find((item) => Number(item.id) === Number(input)) ?? null;
    case "bookings.create": {
      const saved = await appendPublicBooking(input ?? {});
      return saved.content.bookings[0] ?? null;
    }
    case "auth.me":
      return null;
    case "auth.logout":
      return { success: true };
    default:
      return trpcError(path, `No procedure found on path "${path}"`);
  }
}

export default async function handler(req, res) {
  const pathQuery = req.query.trpc;
  const rawPath = Array.isArray(pathQuery) ? pathQuery.join("/") : String(pathQuery || "");
  const batch = req.query.batch === "1";
  const paths = rawPath.split(",").filter(Boolean);
  const body = req.method === "GET" ? undefined : await readRequestBody(req);
  const rawInput = req.method === "GET" ? req.query.input : body;

  const results = await Promise.all(
    paths.map(async (procedurePath, index) => {
      const result = await runProcedure(procedurePath, parseInput(rawInput, index, batch));
      return result?.error ? result : trpcResult(result);
    })
  );

  sendJson(res, 200, batch ? results : results[0] ?? trpcError(rawPath, "Missing procedure path"));
}
