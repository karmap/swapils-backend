import type { Context, Next } from "hono";

export function kvCacheMiddleware(prefix: string, TTL = 60) {
  return async (
    c: Context<{ Bindings: Env }>,
    next: Next
  ) => {
    const url = new URL(c.req.url);
    const key = `${prefix}${c.req.path}`;

    const cached = await c.env.SWAPI_KV.get(key);
    if (cached) {
      c.res = new Response(cached, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-KV-Cache": "HIT",
        "Cache-Control": `public, max-age=${TTL}`
      }
      });
      return; 
    }

    await next();

    // Don't cache if the handler returned an error
    if (!c.res || !c.res.ok) return;

    // Clone and read the body
    const clone = c.res.clone();
    const body = await clone.text();

    // Avoid caching empty or non-JSON responses
    if (!body || !clone.headers.get("Content-Type")?.includes("application/json")) {
      return;
    }

    console.log(`[KV CACHE] Caching response for key: ${key}`);
    
    c.executionCtx.waitUntil(
      c.env.SWAPI_KV.put(key, body, { expirationTtl: TTL })
    );
  };
}