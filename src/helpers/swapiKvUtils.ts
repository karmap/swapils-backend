// Convert a SWAPI url to a KV key that matches your middleware format
export function getKvKeyFromSwapiUrl(url: string) {
  const u = new URL(url);
  const path = u.pathname.replace("/api", ""); // "/films/1/"
  return `swapi:${path}`;
}

// Fetch a SWAPI resource, using KV first as cache fallback
export async function fetchSwapiResourceWithKv(
  url: string,
  env: Env,
  TTL = 60 * 20
) {
  const key = getKvKeyFromSwapiUrl(url);

  const cached = await env.SWAPI_KV.get(key);
  if (cached) return JSON.parse(cached);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Upstream request failed: ${url}`);
  }

  const json = await res.json();

  env.SWAPI_KV.put(key, JSON.stringify(json), { expirationTtl: TTL });

  return json;
}

// Expand an array of SWAPI URLs into { id, title } objects
export async function expandSwapiResources(urls: string[], env: Env) {
  if (!urls || urls.length === 0) return [];

  return Promise.all(
    urls.map(async (url) => {
      const data = await fetchSwapiResourceWithKv(url, env);

      const id = data.url.split("/").filter(Boolean).pop();

      return {
        id,
        title: data.title || data.name
      };
    })
  );
}