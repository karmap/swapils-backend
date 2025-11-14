import { computeStats, StatsResult } from "../helpers/computeStats";

const CACHE_KEY = "stats_snapshot";
const CACHE_TTL_MS = 2 * 60 * 1000;

export async function handleStats(env: Env): Promise<Response> {
  const raw = await env.STATS_CACHE.get(CACHE_KEY);

  if (raw) {
    try {
      const cached: StatsResult = JSON.parse(raw);
      const age = Date.now() - new Date(cached.generated_at).getTime();

      if (age < CACHE_TTL_MS) {
        return Response.json(cached);
      }
    } catch {}
  }

  const freshStats = await computeStats(env, "endpoint");
  await env.STATS_CACHE.put(CACHE_KEY, JSON.stringify(freshStats));
  return Response.json(freshStats);
}