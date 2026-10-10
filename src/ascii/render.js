// SPDX-FileCopyrightText: 2026 Aesthetic Vulpes (github.com/didvc)
// SPDX-License-Identifier: AGPL-3.0-only
// Render an art set as an animated SVG. Frames are <g> groups switched on and off with CSS
// keyframes (step timing), which GitHub's image proxy and every modern browser play without scripts.
import { SITE } from "./site.generated.js";

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const r1 = (n) => Math.round(n * 10) / 10;
// Root size in rem (1rem = 16px) so the whole image follows the reader's browser font-size
// setting; identical to pixels at the default 16px. The px option pins exact pixels instead.
const dim = (n, px) => (px ? String(n) : `${Math.round((n / 16) * 10000) / 10000}rem`);
const pct = (n) => Math.round(n * 1000) / 1000;

// Rough advance width in em, used only to size the canvas. Fonts differ, so the result is padded.
export function cellWidth(ch) {
  const c = ch.codePointAt(0);
  if ((c >= 0x300 && c <= 0x36f) || (c >= 0x1ab0 && c <= 0x1aff) || (c >= 0x20d0 && c <= 0x20ff) || (c >= 0xfe20 && c <= 0xfe2f)) return 0;
  if (c >= 0xff61 && c <= 0xff9f) return 0.6;
  if ((c >= 0x1100 && c <= 0x115f) || (c >= 0x2e80 && c <= 0xa4cf) || (c >= 0xac00 && c <= 0xd7a3) || (c >= 0xf900 && c <= 0xfaff) || (c >= 0xfe30 && c <= 0xfe4f) || (c >= 0xff00 && c <= 0xff60) || (c >= 0xffe0 && c <= 0xffe6)) return 1;
  if (c >= 0x2500 && c <= 0x25ff) return 0.8;
  return 0.6;
}
export const lineWidth = (line) => [...line].reduce((w, ch) => w + cellWidth(ch), 0);

// Default: GitHub's own colors (text, canvas, border), so the image reads like the README around it.
// An image cannot inherit the page's colors, so they are matched exactly. "warm" keeps the readmes palette.
const PALETTES = {
  github: { light: { bg: "#ffffff", fg: "#1f2328", line: "#d1d9e0" }, dark: { bg: "#0d1117", fg: "#f0f6fc", line: "#3d444d" } },
  warm: { light: { bg: "#fff8f1", fg: "#3b2418", line: "#ecd9c8" }, dark: { bg: "#241e2b", fg: "#f6e7dc", line: "#3a3142" } },
};
const FONT = 'ui-monospace,SFMono-Regular,Menlo,Consolas,"DejaVu Sans Mono","Noto Sans Mono CJK JP","MS Gothic","Hiragino Kaku Gothic ProN",monospace';

export function renderArt(art, opts) {
  const S = opts.size, lh = r1(S * 1.35);
  const frames = opts.still ? [art.frames[0]] : art.frames;
  const base = art.d ?? art.frames.map(() => art.ms);
  const durs = (opts.still ? [base[0]] : base).map((ms) => (ms * 100) / opts.speed);
  const total = durs.reduce((a, b) => a + b, 0);
  const align = opts.align ?? art.align ?? "center";
  const nLines = Math.max(...frames.map((f) => f.length));
  const textW = Math.max(...frames.flatMap((f) => f.map(lineWidth))) * S;
  const pad = opts.card ? r1(S * 0.7 + opts.border) : r1(S * 0.3);
  const bounceRoom = opts.bounce ? r1(S * 0.25) : 0;
  const W = Math.ceil(textW * 1.12 + pad * 2);
  const H = Math.ceil(nLines * lh + pad * 2 + bounceRoom);
  const x = align === "left" ? pad : r1(W / 2);
  const anchor = align === "left" ? "start" : "middle";
  const fg = opts.color ? "#" + opts.color : art.color && !opts.rainbow ? "#" + art.color : "var(--fg)";

  const vars = (p) => `--bg:${p.bg};--fg:${p.fg};--line:${p.line};`;
  const PALETTE = PALETTES[opts.palette] ?? PALETTES.github;
  let css = `svg{${vars(opts.theme === "dark" ? PALETTE.dark : PALETTE.light)}}`;
  if (opts.theme === "auto" || opts.theme === "transparent") css += `@media (prefers-color-scheme:dark){svg{${vars(PALETTE.dark)}}}`;
  css += `text{font-family:${FONT};font-size:${S}px;white-space:pre;fill:${fg}}`;
  if (frames.length > 1) {
    css += `.f{opacity:0;animation:${r1(total) / 1000}s step-end infinite}`;
    let t = 0;
    durs.forEach((d, i) => {
      const a = pct((t / total) * 100), b = pct(((t + d) / total) * 100);
      css += a === 0
        ? `@keyframes k${i}{0%{opacity:1}${b}%{opacity:0}100%{opacity:0}}`
        : `@keyframes k${i}{0%{opacity:0}${a}%{opacity:1}${b}%{opacity:0}100%{opacity:0}}`;
      css += `.f${i}{animation-name:k${i}}`;
      t += d;
    });
    css += "@media (prefers-reduced-motion:reduce){.f{animation:none}.f0{opacity:1}}";
  }
  if (opts.rainbow) {
    css += "@keyframes rb{0%{fill:#ff5d8f}20%{fill:#f08a3c}40%{fill:#e6b800}60%{fill:#2bb3a3}80%{fill:#4a90e2}100%{fill:#ff5d8f}}";
    css += "text{animation:rb 4s linear infinite}@media (prefers-reduced-motion:reduce){text{animation:none}}";
  }
  if (opts.bounce) {
    css += `@keyframes bo{0%,100%{transform:translateY(0)}50%{transform:translateY(-${bounceRoom}px)}}.b{animation:bo 1.2s ease-in-out infinite}`;
    css += "@media (prefers-reduced-motion:reduce){.b{animation:none}}";
  }

  const top = pad + bounceRoom;
  const groups = frames.map((f, i) =>
    `<g class="f f${i}">` +
    f.map((line, j) => `<text x="${x}" y="${r1(top + j * lh + lh * 0.78)}" text-anchor="${anchor}">${esc(line)}</text>`).join("") +
    "</g>",
  );
  let bg = "";
  if (opts.card) {
    const b = opts.border, rad = r1(Math.min(W, H) * 0.18);
    if (b) bg += `<rect width="${W}" height="${H}" rx="${rad}" fill="#${opts.color ?? "f08a3c"}"/>`;
    if (opts.theme !== "transparent" || b) bg += `<rect x="${b}" y="${b}" width="${W - 2 * b}" height="${H - 2 * b}" rx="${Math.max(0, rad - b)}" fill="var(--bg)"${b ? "" : ' stroke="var(--line)"'}/>`;
  }
  const label = `ASCII art: ${art.title}${frames.length > 1 ? " (animated)" : ""}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${dim(W, opts.px)}" height="${dim(H, opts.px)}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">` +
    `<!-- (c) ${esc(SITE.copyrightYear)} ${esc(SITE.copyrightHolder)} (${esc(SITE.copyrightUrl)}) -->` +
    `<title id="t">${esc(label)}</title><style>${css}</style>` +
    bg + `<g class="b">${frames.length > 1 ? groups.join("") : groups[0].replace('class="f f0"', "")}</g></svg>`
  );
}

export function renderNotice(message) {
  const text = `ascii: ${message} (see help)`;
  const W = Math.round(text.length * 7.2 + 24);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${dim(W)}" height="${dim(28)}" viewBox="0 0 ${W} 28" role="img" aria-label="${esc(text)}">` +
    `<title>${esc(text)}</title><rect width="${W}" height="28" rx="14" fill="#fde2e4"/>` +
    `<text x="${W / 2}" y="18.5" text-anchor="middle" fill="#9b2c3a" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="12">${esc(text)}</text></svg>`
  );
}
