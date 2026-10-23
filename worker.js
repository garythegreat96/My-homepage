const CACHE_ROOT = "https://oideas-search-cache.invalid/results/";
const SEARCH_HOST = "oideas.garyxiao.org";
const SEARCH_ORIGIN = "https://oideas.garyxiao.org";
const recentSearches = new Map();

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders
    }
  });
}

async function digest(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}

function safeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 5).flatMap(item => {
    try {
      const url = new URL(String(item.url || ""));
      if (url.protocol !== "https:" && url.protocol !== "http:") return [];
      const title = String(item.title || "").trim().slice(0, 240);
      if (!title) return [];
      return [{
        title,
        url: url.href,
        description: String(item.description || "").trim().slice(0, 520)
      }];
    } catch {
      return [];
    }
  });
}

async function handleSearch(request, env, ctx) {
  if (request.method !== "POST") {
    return json({ error: "Use POST to search for an idea." }, 405, { allow: "POST" });
  }
  if (request.headers.get("Origin") !== SEARCH_ORIGIN) {
    return json({ error: "This search is only available from Original Ideas." }, 403);
  }
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 8000) return json({ error: "That idea is too long to search." }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Enter an idea before searching." }, 400);
  }
  const idea = typeof body.idea === "string" ? body.idea.trim() : "";
  if (!idea || idea.length > 500) {
    return json({ error: "Enter an idea of 1 to 500 characters." }, 400);
  }

  const normalized = idea.toLocaleLowerCase().replace(/\s+/g, " ");
  const key = await digest(normalized);
  const cacheKey = new Request(CACHE_ROOT + key);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return json(await cached.json());

  const now = Date.now();
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const lastSearch = recentSearches.get(ip) || 0;
  if (now - lastSearch < 2500) {
    return json({ error: "Please wait a moment before searching again." }, 429, { "retry-after": "3" });
  }
  recentSearches.set(ip, now);
  if (recentSearches.size > 2000) {
    for (const [address, timestamp] of recentSearches) {
      if (now - timestamp > 60_000) recentSearches.delete(address);
    }
  }

  try {
    const upstream = await env.AI.websearch({
      gatewayId: "default",
      query: idea,
      provider: "ceramic",
      limit: 5
    });
    if (!upstream.ok) {
      if (upstream.status === 402) {
        return json({ error: "Live search is temporarily unavailable. Please try again later." }, 503);
      }
      return json({ error: "Live search is temporarily unavailable. Please try again later." }, 502);
    }

    const payload = await upstream.json();
    const responseData = { items: safeItems(payload.items) };
    const cachedResponse = new Response(JSON.stringify(responseData), {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=1800" }
    });
    ctx.waitUntil(cache.put(cacheKey, cachedResponse));
    return json(responseData);
  } catch {
    return json({ error: "Live search is temporarily unavailable. Please try again later." }, 503);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/search") {
      if (url.hostname !== SEARCH_HOST) return json({ error: "Not found." }, 404);
      return handleSearch(request, env, ctx);
    }
    return env.ASSETS.fetch(request);
  }
};