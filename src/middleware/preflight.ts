import { applyCors } from "./cors";

export function handlePreflight(request: Request): Response {
  return applyCors(
    request,
    new Response(null, { status: 204 })
  );
}