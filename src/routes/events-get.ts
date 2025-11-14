
export async function handleGetAllEvents(env: Env): Promise<Response> {
  const result = await env.DB.prepare(
    `SELECT id, query, type, timestamp, duration, clientId
     FROM events
     ORDER BY id DESC
     LIMIT 200`
  ).all();

  return Response.json({
    total: result.results?.length ?? 0,
    events: result.results ?? []
  });
}