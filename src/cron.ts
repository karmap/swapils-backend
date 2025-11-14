import { computeStats } from "./helpers/computeStats";

export async function scheduled(
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext
) {
  try {
    const stats = await computeStats(env, "cron");
    await env.STATS_CACHE.put("stats_snapshot", JSON.stringify(stats));
    console.log(`Cron job: stats snapshot updated at ${stats.generated_at}`);
  } catch (err) {
    console.error("Error in cron stats:", err);
  }
}