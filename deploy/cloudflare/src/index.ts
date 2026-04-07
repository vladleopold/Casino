interface Env {
  WEB_ORIGIN: string;
  DIRECTUS_ORIGIN: string;
  EVENTS_ORIGIN: string;
}

function buildUpstreamUrl(requestUrl: URL, origin: string, pathname: string) {
  const upstream = new URL(pathname, origin);
  upstream.search = requestUrl.search;
  return upstream;
}

async function proxyWithHeaders(request: Request, upstreamUrl: URL) {
  const upstreamRequest = new Request(upstreamUrl, request);
  const response = await fetch(upstreamRequest, {
    cf: {
      cacheEverything: request.method === "GET"
    }
  });

  const headers = new Headers(response.headers);
  headers.set("x-slotcity-edge", "cloudflare");
  headers.set("x-slotcity-cache-mode", request.method === "GET" ? "cacheable" : "pass-through");

  return new Response(response.body, {
    status: response.status,
    headers
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestUrl = new URL(request.url);

    if (requestUrl.pathname === "/edge/health") {
      return Response.json({
        status: "ok",
        webOrigin: env.WEB_ORIGIN,
        directusOrigin: env.DIRECTUS_ORIGIN,
        eventsOrigin: env.EVENTS_ORIGIN
      });
    }

    if (requestUrl.pathname.startsWith("/events")) {
      const eventsPath =
        requestUrl.pathname === "/events/health"
          ? "/health"
          : requestUrl.pathname.replace(/^\/events/, "/events");
      const upstreamUrl = buildUpstreamUrl(
        requestUrl,
        env.EVENTS_ORIGIN,
        eventsPath
      );
      return proxyWithHeaders(request, upstreamUrl);
    }

    if (
      requestUrl.pathname.startsWith("/assets") ||
      requestUrl.pathname.startsWith("/cms")
    ) {
      const upstreamUrl = buildUpstreamUrl(
        requestUrl,
        env.DIRECTUS_ORIGIN,
        requestUrl.pathname.replace(/^\/cms/, "")
      );
      return proxyWithHeaders(request, upstreamUrl);
    }

    const upstreamUrl = buildUpstreamUrl(requestUrl, env.WEB_ORIGIN, requestUrl.pathname);
    return proxyWithHeaders(request, upstreamUrl);
  }
};
