export async function logSwapiMetrics(
  req: Request,
  {
    elapsed,
    cacheHit,
    ip,
    location
  }: {
    elapsed: number;
    cacheHit: boolean;
    ip: string;
    location: { country: string | null; city: string | null };
  }
) {
  const path = new URL(req.url).pathname;

  console.log("[SWAPI_METRICS]", {
    route: path,
    cacheHit,
    responseTimeMs: elapsed,

    location: {
      country: location.country,
      city: location.city
    },

    ip,
    timestamp: Date.now()
  });
}