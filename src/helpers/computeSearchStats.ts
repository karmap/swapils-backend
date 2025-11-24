export type TopQuery = {
  query: string;
  count: number;
  percentage: number;
};

export type TopCountry = {
  country: string;
  count: number;
  percentage: number;
};

export type StatsResult = {
  total: number;
  avg_duration: number;
  peak_hour: number | null;
  generated_at: string;
  source: string;
  top_queries: TopQuery[];
  top_countries: TopCountry[];
};

export async function computeSearchStats(env: Env, source: string): Promise<StatsResult> {

  const totalRow = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM search_metrics"
  ).first<{ total: number }>();

  const total = totalRow?.total ?? 0;

  const avgRow = await env.DB.prepare(
    "SELECT AVG(duration) AS avg_duration FROM search_metrics"
  ).first<{ avg_duration: number }>();

  const avg_duration = avgRow?.avg_duration ?? 0;

  const peakRow = await env.DB.prepare(
    `SELECT strftime('%H', datetime(timestamp/1000, 'unixepoch')) AS hour,
            COUNT(*) AS count
     FROM search_metrics
     GROUP BY hour
     ORDER BY count DESC
     LIMIT 1`
  ).first<{ hour: string; count: number }>();

  const peak_hour = peakRow?.hour ? Number(peakRow.hour) : null;

  const topRows = await env.DB.prepare(
    `SELECT query, COUNT(*) AS count
     FROM search_metrics
     GROUP BY query
     ORDER BY count DESC
     LIMIT 5`
  ).all<{ query: string; count: number }>();

  const top_queries: TopQuery[] = topRows?.results?.map(r => ({
    query: r.query,
    count: r.count,
    percentage: total > 0 ? (r.count / total) * 100 : 0,
  })) ?? [];

  const countryRows = await env.DB.prepare(
    `SELECT country, COUNT(*) AS count
     FROM search_metrics
     WHERE country IS NOT NULL AND country != ''
     GROUP BY country
     ORDER BY count DESC
     LIMIT 5`
  ).all<{ country: string; count: number }>();

  const top_countries: TopCountry[] =
    countryRows?.results?.map(r => ({
      country: r.country,
      count: r.count,
      percentage: total > 0 ? (r.count / total) * 100 : 0
    })) ?? [];

  return {
    total,
    avg_duration,
    peak_hour,
    generated_at: new Date().toISOString(),
    source,
    top_queries,
    top_countries,
  };
}