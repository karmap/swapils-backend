export async function scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
  try {
    await env.EVENTS_QUEUE.send({
      event_type: "search_stats_job",
      timestamp: Date.now()
    });

    console.log("Cron: queued search_stats_job job");
  } catch (err) {
    console.error("Cron error:", err);
  }
}