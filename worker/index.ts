import manifest from "../package.json" with { type: "json" };

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

function jsonResponse(
  body: object,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export default {
  fetch(request: Request, env: Env): Response | Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/live") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return jsonResponse(
          { status: "error", error: "method_not_allowed" },
          405,
          { Allow: "GET, HEAD" },
        );
      }
      const response = jsonResponse({
        status: "ok",
        service: manifest.name,
        version: manifest.version,
        scope: "worker-liveness",
        dataMode: "simulation",
      });
      return request.method === "HEAD"
        ? new Response(null, response)
        : response;
    }
    if (pathname.startsWith("/api/")) {
      return jsonResponse({ status: "error", error: "not_found" }, 404);
    }
    return env.ASSETS.fetch(request);
  },
};
