import { Hono } from "hono";
import { ApiEvent } from "../types/events";
import { computeEventStats } from "../helpers/computeEventStats";
import { kvCacheMiddleware } from "../middleware/kvCacheMiddleware";

export const apiAnalyticsRouter = new Hono<{ Bindings: Env }>();

apiAnalyticsRouter.get("/events", async (c) => {
  const rows = await c.env.DB
    .prepare("SELECT * FROM events ORDER BY id DESC LIMIT 200")
    .all();

  return c.json(rows.results ?? []);
});

apiAnalyticsRouter.get(
  "/events/stats",
  kvCacheMiddleware("stats:events:stats:", 60),
  async (c) => {
    const stats = await computeEventStats(c.env, "endpoint");
    return c.json(stats);
  }
);

apiAnalyticsRouter.post("/events", async (c) => {
  try {
    const body = await c.req.json();

    const event: ApiEvent = {
      event_type: "api_event",
      query: body.query,
      type: body.type,
      timestamp: body.timestamp ?? Date.now(),
      duration: body.duration,
      clientId: body.clientId
    };

    await c.env.EVENTS_QUEUE.send(event);

    return c.json({ status: "queued" });

  } catch (err) {
    console.error("Failed to queue user event:", err);
    return c.json({ error: "Invalid event payload" }, 400);
  }
});