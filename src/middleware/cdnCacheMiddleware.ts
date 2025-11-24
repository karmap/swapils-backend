import type { Context, Next } from "hono";

export const cdnCacheMiddleware = async (
    c: Context<{ Bindings: Env }>,
    next: Next
  ) => {
  if (!caches.default) return next();

  const req = c.req.raw;
  const cache = caches.default;  

  const hit = await cache.match(req);
  if (hit) {    
    return hit;
  }
  
  await next();
  c.executionCtx.waitUntil(cache.put(req, c.res.clone()));
};