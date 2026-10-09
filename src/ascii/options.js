// SPDX-FileCopyrightText: 2026 Aesthetic Vulpes (github.com/didvc)
// SPDX-License-Identifier: AGPL-3.0-only
// Parse /ascii/<token>/<token>/... into validated options. Only whitelisted keywords are accepted.
import { ARTS, TAGS } from "./arts.js";

export const THEMES = ["auto", "light", "dark", "transparent"];
const bounded = (v, min, max) => Math.min(max, Math.max(min, v));

export function parseOptions(segments) {
  const opts = { art: null, tag: null, mode: "random", card: false, theme: "auto", size: 22, border: 0, color: null, rainbow: false, bounce: false, still: false, speed: 100, align: null };
  if (segments.length > 16 || segments.join("/").length > 512) return { error: "too many options" };
  for (let i = 0; i < segments.length; i++) {
    let t = String(segments[i]).toLowerCase();
    if (i === segments.length - 1) t = t.replace(/\.svg$/, "");
    if (!t) continue;
    let m;
    const art = ARTS.find((a) => a.name === t);
    if (art) opts.art = art;
    else if (TAGS.includes(t)) opts.tag = t;
    else if (t === "random" || t === "daily") opts.mode = t;
    else if (THEMES.includes(t)) opts.theme = t;
    else if (t === "card") opts.card = true;
    else if (t === "rainbow") opts.rainbow = true;
    else if (t === "bounce") opts.bounce = true;
    else if (t === "static") opts.still = true;
    else if (t === "left" || t === "center") opts.align = t;
    else if ((m = t.match(/^size-(\d{1,3})$/))) opts.size = bounded(+m[1], 12, 64);
    else if ((m = t.match(/^border-(\d{1,2})$/))) opts.border = bounded(+m[1], 0, 8);
    else if ((m = t.match(/^speed-(\d{1,3})$/))) opts.speed = bounded(+m[1], 25, 400);
    else if ((m = t.match(/^color-([0-9a-f]{3}|[0-9a-f]{6})$/))) opts.color = m[1];
    else return { error: `unknown option #${i + 1}` };
  }
  if (opts.border) opts.card = true;
  return { opts };
}
