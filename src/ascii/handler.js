// SPDX-FileCopyrightText: 2026 Aesthetic Vulpes (github.com/didvc)
// SPDX-License-Identifier: AGPL-3.0-only
// Request -> SVG. Pure function of the URL path (and the clock for random/daily).
import { ARTS } from "./arts.js";
import { parseOptions } from "./options.js";
import { renderArt, renderNotice } from "./render.js";

const NO_STORE = "no-cache, no-store, max-age=0, must-revalidate";
const HEADERS = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
  "X-Content-Type-Options": "nosniff",
  "Access-Control-Allow-Origin": "*",
  "Referrer-Policy": "no-referrer",
};

export function handle(method, segments, now = new Date()) {
  if (method !== "GET" && method !== "HEAD") return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  const out = (body, cache, extra = {}) => new Response(method === "HEAD" ? null : body, { headers: { ...HEADERS, "Cache-Control": cache, ...extra } });
  const { opts, error } = parseOptions(segments);
  if (error) return out(renderNotice(error), NO_STORE, { "X-Ascii-Error": error });

  let art = opts.art, cache = "public, max-age=86400";
  if (!art) {
    const pool = opts.tag ? ARTS.filter((a) => a.tags.includes(opts.tag)) : ARTS;
    if (opts.mode === "daily") {
      const day = Math.floor(now.getTime() / 86400000);
      art = pool[day % pool.length];
      cache = `public, max-age=${Math.max(60, Math.floor(((day + 1) * 86400000 - now.getTime()) / 1000))}`;
    } else {
      art = pool[crypto.getRandomValues(new Uint32Array(1))[0] % pool.length];
      cache = NO_STORE;
    }
  }
  return out(renderArt(art, opts), cache, { "X-Ascii-Art": art.name });
}
