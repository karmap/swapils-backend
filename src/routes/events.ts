
export async function handleEvents(request: Request, env: Env) {
  const text = await request.text();
  const event = JSON.parse(text);

  await env.EVENTS_QUEUE.send(event);

  return Response.json({ status: "queued" });
}