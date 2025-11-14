export function applyCors(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);

  const allowedOrigins = [
    "http://localhost:5173",
    "https://swapils.vercel.app"
  ];
  const origin = request.headers.get("Origin") || "";
  const isAllowed = allowedOrigins.includes(origin);
  if (isAllowed) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400"); 

  return new Response(response.body, {
    status: response.status,
    headers
  });
}