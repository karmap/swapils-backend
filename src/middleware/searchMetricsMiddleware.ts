import type { Context, Next } from "hono";

export async function searchMetricsMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  const start = Date.now();
  const url = new URL(c.req.url);
  const segments = url.pathname.split("/");

  const resource = segments[3] ?? "unknown"; // "people" | "films"
  const query = segments[5] ?? "unknown";

  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const country = c.req.raw.cf?.country ?? "unknown";
  const city = c.req.raw.cf?.city ?? "unknown";

  await next();

  const duration = Date.now() - start;
  const cache = c.res.headers.get("X-KV-Cache") ?? "MISS";
  const timestamp = Date.now();

  // Send to EVENTS_QUEUE (your existing queue)
  c.executionCtx.waitUntil(
    c.env.EVENTS_QUEUE.send({
      event_type: "search_metric",
      resource,
      query,
      duration,
      cache,
      ip,
      country,
      city,
      timestamp
    })
  );

  console.log("[SEARCH METRICS]", {
    resource,
    query,
    duration,
    cache,
    ip,
    country,
    city,
    timestamp
  });
}