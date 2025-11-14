import { handleStats } from "./routes/stats";
import { handleHealth } from "./routes/health";
import { handleEvents } from "./routes/events";
import { handleGetAllEvents } from "./routes/events-get";

import { applyCors } from "./middleware/cors";
import { handlePreflight } from "./middleware/preflight";
import { scheduled } from "./cron";
import { queue } from "./queue";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let response: Response;

    if (request.method === "OPTIONS") {
      return handlePreflight(request);
    }

    if (url.pathname === "/api/stats") {
      const res = await handleStats(env);
      return applyCors(request, res);
    }

    if (url.pathname === "/api/health") {
      const res = await handleHealth(env);
      return applyCors(request, res);
    }

    if (url.pathname === "/api/events" && request.method === "GET") {
      response = await handleGetAllEvents(env);
      return applyCors(request, response);
    }

    if (url.pathname === "/api/events" && request.method === "POST") {
      response = await handleEvents(request, env);
      return applyCors(request, response);
    }

    response = Response.json(
      { error: "Ruta no existe", path: url.pathname },
      { status: 404 }
    );

    return applyCors(request,response);
  },

  queue,
  scheduled,
};