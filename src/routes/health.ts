
export async function handleHealth(env: Env): Promise<Response> {
  const now = new Date().toISOString();

  let reachable = false;
  let latency = null;
  let total = null;

  const t0 = Date.now();
  try {
    await env.DB.prepare("SELECT 1").first();
    reachable = true;
    latency = Date.now() - t0;

    const row = await env.DB
      .prepare("SELECT COUNT(*) AS total FROM events")
      .first();

    total = row?.total ?? 0;
  } catch {}

  return Response.json({
    status: reachable ? "ok" : "db_unreachable",
    db: {
      reachable,
      latency_ms: latency,
      total_events: total
    },
    timestamp: now
  });
}