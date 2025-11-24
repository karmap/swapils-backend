import { Hono } from "hono";
import { cors } from "hono/cors";

import { queue } from "./queue";
import { scheduled } from "./cron";

import { apiSwapiRouter } from "./routes/apiSwapiRouter";
import { apiInfoRouter } from "./routes/apiInfoRouter";
import { apiAnalyticsRouter } from "./routes/apiAnalyticsRouter";
import { apiCacheRouter } from "./routes/apiCacheRouter";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: ["http://localhost:5173", "https://swapils.vercel.app"],
  allowMethods: ["GET","POST","OPTIONS"],
  allowHeaders: ["Content-Type","Authorization"],
  credentials: true,
  maxAge: 86400
}));

app.route("/api/info", apiInfoRouter);
app.route("/api/swapi", apiSwapiRouter);
app.route("/api/analytics", apiAnalyticsRouter);
app.route("/api/cache", apiCacheRouter);

app.notFound((c) =>
  c.json({ error: "Route not found", path: c.req.path }, 404)
);

export default {
  fetch: app.fetch,
  queue,
  scheduled
};