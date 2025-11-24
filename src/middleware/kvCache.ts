export async function withKVCache(req: Request, env: Env, options: any) {
  const url = new URL(req.url);

  const {
    kv,
    key,
    upstreamUrl,
    ttl = 86400,
  } = options;

  const skipCache = url.searchParams.get("skipCache") === "1";
  
  // 1. KV cache lookup
  if (!skipCache) {
    const cached = await kv.get(key, "json");
    if (cached) {
      return new Response(JSON.stringify({
        cacheHit: true,
        ... cached,
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // 2. Fetch upstream
  const res = await fetch(upstreamUrl);  

  if (!res.ok) {
    return new Response("Upstream error", { status: res.status });
  }

  const data = await res.clone().json();

  // 3. Store in KV
  await kv.put(key, JSON.stringify(data), {
    expirationTtl: ttl,
  });

  // 4. Respond with data
  return new Response(JSON.stringify({
    cacheHit: false,
    ...data as any,
  }), {
    headers: { "Content-Type": "application/json" },
  });
}