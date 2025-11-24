import { Hono } from "hono";
import { kvCacheMiddleware } from "../middleware/kvCacheMiddleware";
import { getMovieWithPeople, getPersonWithMovies } from "../helpers/swapiExpander";
import { searchMetricsMiddleware } from "../middleware/searchMetricsMiddleware";
import { SWAPI_PREFIX } from "../types/constants";
// import { cdnCacheMiddleware } from "../middleware/cdnCacheMiddleware";

export const apiSwapiRouter = new Hono<{ Bindings: Env }>();

apiSwapiRouter.use("/people/search/*", searchMetricsMiddleware);
apiSwapiRouter.use("/films/search/*", searchMetricsMiddleware);

// apiSwapiRouter.use("*", cdnCacheMiddleware);
apiSwapiRouter.use("*", kvCacheMiddleware(SWAPI_PREFIX, 60 * 60 * 24 * 7));

apiSwapiRouter.get("/people/:id/with-movies", async (c) => {
  const id = c.req.param("id");
  const result = await getPersonWithMovies(id, c.env);
  return c.json(result);
});

apiSwapiRouter.get("/films/:id/with-people", async (c) => {
  const id = c.req.param("id");
  const result = await getMovieWithPeople(id, c.env);
  return c.json(result);
});

apiSwapiRouter.get("/people/search/:query", async (c) => {
  const q = c.req.param("query");
  const upstreamUrl = `https://swapi.dev/api/people/?search=${q}`;
  return fetch(upstreamUrl);
});

apiSwapiRouter.get("/films/search/:query", async (c) => {
  const q = c.req.param("query");
  const upstreamUrl = `https://swapi.dev/api/films/?search=${q}`;
  return fetch(upstreamUrl);
});