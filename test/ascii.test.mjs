// SPDX-FileCopyrightText: 2026 Aesthetic Vulpes (github.com/didvc)
// SPDX-License-Identifier: AGPL-3.0-only
import { test } from "node:test";
import assert from "node:assert/strict";
import { handle } from "../src/ascii/handler.js";
import { ARTS, TAGS } from "../src/ascii/arts.js";
import { parseOptions } from "../src/ascii/options.js";
import { servePage } from "../src/ascii/pages.js";

const get = async (path, now) => {
  const res = handle("GET", path.split("/").filter(Boolean), now);
  return { res, body: await res.text() };
};
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{FE0F}]/u;

test("collection: 20+ sets, unique slugs, 1 to 3 lines, valid durations, every tag used", () => {
  assert.ok(ARTS.length >= 20);
  assert.equal(new Set(ARTS.map((a) => a.name)).size, ARTS.length);
  for (const a of ARTS) {
    assert.match(a.name, /^[a-z0-9][a-z0-9-]*$/);
    assert.ok(!TAGS.includes(a.name) && !["random", "daily", "card", "static"].includes(a.name), a.name);
    assert.ok(a.frames.length >= 1 && a.frames.every((f) => f.length >= 1 && f.length <= 3), a.name);
    const d = a.d ?? a.frames.map(() => a.ms);
    assert.ok(d.length === a.frames.length && d.every((x) => x > 0), a.name);
    assert.ok(!a.frames.flat().some((l) => EMOJI.test(l)), `${a.name} has an emoji`);
  }
  for (const t of TAGS) assert.ok(ARTS.some((a) => a.tags.includes(t)), t);
});

test("named art is animated, cacheable and escaped", async () => {
  const { res, body } = await get("table-flip");
  assert.equal(res.headers.get("x-ascii-art"), "table-flip");
  assert.match(res.headers.get("cache-control"), /max-age=86400/);
  assert.equal((body.match(/<g class="f f\d+">/g) || []).length, 4);
  assert.match(body, /@keyframes k3/);
  assert.match(body, /prefers-reduced-motion/);
  const { body: b2 } = await get("bunny");
  assert.ok(!/<text[^>]*>[^<]*[<>&"][^<]*<\/text>/.test(b2.replace(/&(amp|lt|gt|quot|#39);/g, "")), "text is escaped");
});

test("keyframe windows cover the loop exactly once", async () => {
  const { body } = await get("peek");
  const frames = [...body.matchAll(/@keyframes k(\d+)\{([^}]*\}[^}]*\}[^}]*\}(?:[^}]*\})?)\}/g)];
  assert.equal(frames.length, 6);
  assert.match(body, /@keyframes k0\{0%\{opacity:1\}/);
  assert.match(body, /@keyframes k5\{0%\{opacity:0\}[\d.]+%\{opacity:1\}100%\{opacity:0\}/);
});

test("tags pick from their pool; daily is stable; random is uncached", async () => {
  for (let i = 0; i < 15; i++) {
    const name = (await get("cat")).res.headers.get("x-ascii-art");
    assert.ok(ARTS.find((a) => a.name === name).tags.includes("cat"), name);
  }
  const a = await get("2ch/daily", new Date("2026-10-10T01:00:00Z"));
  const b = await get("2ch/daily", new Date("2026-10-10T22:00:00Z"));
  assert.equal(a.res.headers.get("x-ascii-art"), b.res.headers.get("x-ascii-art"));
  assert.match((await get("")).res.headers.get("cache-control"), /no-store/);
});

test("options: static has one frame, clamping, unknown option badge without echo", async () => {
  const { body } = await get("owata/static");
  assert.ok(!body.includes("@keyframes k"));
  assert.equal(parseOptions(["size-999"]).opts.size, 64);
  assert.equal(parseOptions(["border-3"]).opts.card, true);
  const bad = await get("owata/<script>");
  assert.equal(bad.res.headers.get("x-ascii-error"), "unknown option #2");
  assert.ok(!bad.body.includes("script"));
  assert.equal(handle("POST", []).status, 405);
});

test("every set renders in every style without NaN", async () => {
  for (const a of ARTS)
    for (const extra of ["", "card/dark", "border-4/rainbow/bounce", "size-64/left/speed-400", "transparent/card/static"]) {
      const { body } = await get(`${a.name}/${extra}`);
      assert.ok(!/NaN|undefined|Infinity/.test(body), `${a.name}/${extra}`);
    }
});

test("help and agents pages", async () => {
  const help = await servePage(new Request("https://readmes.pages.dev/ascii/help"), "help");
  const html = await help.text();
  assert.match(html, /<link rel="canonical" href="https:\/\/readmes\.pages\.dev\/ascii\/help">/);
  assert.match(html, /Aesthetic Vulpes \(github\.com\/didvc\)/);
  assert.match(help.headers.get("content-security-policy"), /script-src 'sha256-/);
  assert.equal((html.match(/<figure>/g) || []).length, ARTS.length);
  assert.match(html, /<div class="gallery strip" role="region"[^>]*tabindex="0">/);
  assert.match(html, /<a class="url" href="https:\/\/readmes\.pages\.dev\/ascii\/owata">https:\/\/readmes\.pages\.dev\/ascii\/owata<\/a>/);
  for (const img of html.matchAll(/<img [^>]*>/g)) assert.match(img[0], /alt="[^"]+"/);
  const md = await (await servePage(new Request("https://readmes.pages.dev/ascii/agents"), "agents")).text();
  assert.match(md, /\| `owata` \| Owata \|/);
  const pv = await servePage(new Request("https://x1.readmes.pages.dev/ascii/help"), "help");
  assert.equal(pv.headers.get("x-robots-tag"), "noindex, nofollow");
});

test("rem sizing by default, px option, rem size tokens", async () => {
  assert.match((await get("owata")).body, /^<svg[^>]*width="[\d.]+rem" height="[\d.]+rem"/);
  assert.match((await get("owata/px")).body, /^<svg[^>]*width="\d+" height="\d+" viewBox/);
  assert.equal(parseOptions(["size-2rem"]).opts.size, 32);
});

test("default colors match GitHub's text; warm keeps the readmes palette", async () => {
  const d = (await get("owata")).body;
  assert.match(d, /--fg:#1f2328;/);
  assert.match(d, /--fg:#f0f6fc;/);
  assert.match((await get("owata/warm")).body, /--fg:#f6e7dc;/);
});
