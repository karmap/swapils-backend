import { computeSearchStats } from "./helpers/computeSearchStats";
import type { EventItem } from "./types/events";

export async function queue(
  batch: MessageBatch<EventItem>,
  env: Env
): Promise<void> {

  const db = env.DB;

  console.log("Processed batch:", batch.messages.length);

  for (const msg of batch.messages) {
    const e = msg.body;
    console.log("Event to insert:", e);

    if (e.event_type === "api_event") {
      // Insert into the existing events table
      await db.prepare(
        `INSERT INTO events (query, type, timestamp, duration, clientId)
         VALUES (?, ?, ?, ?, ?)`
      )
        .bind(e.query, e.type, e.timestamp, e.duration, e.clientId)
        .run();
    }

    else if (e.event_type === "search_metric") {
      // Insert into the new search_metrics table
      await db.prepare(
        `INSERT INTO search_metrics 
         (resource, query, duration, cache, ip, country, city, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          e.resource,
          e.query,
          e.duration,
          e.cache,
          e.ip,
          e.country,
          e.city,
          e.timestamp
        )
        .run();
    }
    
    else if (e.event_type === "search_stats_job") {
        console.log("Processing search_stats_job...");

        const stats = await computeSearchStats(env, "cron-to-queue");
        // Match the key used in the middleware stats:searches:stats:/api/info/searches/stats
        const SEARCH_STATS_KV_KEY = "stats:searches:stats:/api/info/searches/stats";
        await env.SWAPI_KV.put(SEARCH_STATS_KV_KEY, JSON.stringify(stats));

        console.log(
            `Queue: search stats snapshot updated at key "${SEARCH_STATS_KV_KEY}" (${stats.generated_at})`
        );
    }
    
    else {
      console.warn("Unknown event type:", e);
    }
  }
}