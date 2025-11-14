import type { EventItem } from "./types/events";

export async function queue(
  batch: MessageBatch<EventItem>,
  env: Env
): Promise<void> {
  const db = env.DB;

  for (const msg of batch.messages) {
    const e = msg.body;
    console.log("Processed batch:", batch.messages.length);
    console.log("Event to insert:", e);

    await db.prepare(
      `INSERT INTO events (query, type, timestamp, duration, clientId)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(e.query, e.type, e.timestamp, e.duration, e.clientId)
      .run();
  }
}