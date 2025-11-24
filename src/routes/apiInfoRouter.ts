import { Hono } from "hono";
import { computeSearchStats } from "../helpers/computeSearchStats";
import { kvCacheMiddleware } from "../middleware/kvCacheMiddleware";

export const apiInfoRouter = new Hono<{ Bindings: Env }>();

apiInfoRouter.get("/", (c) => {
  return c.json({
    status: "ok",
    service: "swapils-stats-service",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

apiInfoRouter.get("/searches", async (c) => {
  const rows = await c.env.DB
    .prepare("SELECT * FROM search_metrics ORDER BY timestamp DESC LIMIT 100")
    .all();

  return c.json(rows.results ?? []);
});

apiInfoRouter.get(
  "/searches/stats",
  kvCacheMiddleware("stats:searches:stats:", 60 * 5),
  async (c) => {
    const stats = await computeSearchStats(c.env, "endpoint");
    return c.json(stats);
  }
);