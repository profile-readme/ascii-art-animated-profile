// SPDX-FileCopyrightText: 2026 Aesthetic Vulpes (github.com/didvc)
// SPDX-License-Identifier: AGPL-3.0-only
// /ascii/help (gallery + URL builder) and /ascii/agents (Markdown). Computed from the request URL only.
import { SITE } from "./site.generated.js";
import { ARTS, TAGS } from "./arts.js";
import { esc } from "./render.js";

const APP = "ascii";
export const OPTION_GROUPS = [
  {
    title: "What to show",
    rows: [
      ["<art name>", "One art set by name, for example owata, table-flip or cat-walk. See the gallery."],
      [TAGS.join(", "), "A random art set from that tag."],
      ["random", "A random art set from everything (default when no name or tag is given)."],
      ["daily", "One art set per day, changing at 00:00 UTC; combine with a tag to limit the pool."],
    ],
  },
  {
    title: "Look",
    rows: [
      ["size-N", "Font size in pixels, 12 to 64 (default 22)."],
      ["card", "Draw a rounded card behind the art."],
      ["border-N", "Card border width in pixels, 0 to 8; implies card."],
      ["color-RRGGBB", "Text (and border) color as 3 or 6 hex digits without #."],
      ["rainbow", "Cycle the text through soft rainbow colors."],
      ["auto", "Follow the viewer's light or dark preference (default)."],
      ["light, dark", "Force a theme."],
      ["transparent", "No card background even with card."],
      ["left, center", "Override the alignment of the art."],
    ],
  },
  {
    title: "Motion",
    rows: [
      ["speed-N", "Playback speed in percent, 25 to 400 (default 100)."],
      ["bounce", "Gently bob the whole art up and down."],
      ["static", "Show only the first frame, without animation."],
    ],
  },
];

export const isPreviewHost = (host) => /^[^.]+\.[^.]+\.pages\.dev$/i.test(host);
const jsonLd = (d) => JSON.stringify(d).replace(/</g, "\\u003c");
const person = () => ({ "@type": "Person", name: SITE.copyrightHolder, url: SITE.copyrightUrl });

const CSS = `
:root{--bg:#fff8f1;--surface:#fff;--text:#3b2418;--muted:#6b4a38;--link:#9a4310;--accent:#f08a3c;--line:#ecd9c8;--code:#fbeee2;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--bg:#1a1620;--surface:#241e2b;--text:#f6e7dc;--muted:#cdb8a8;--link:#ffb37a;--line:#3a3142;--code:#2c2533}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 ui-rounded,"Hiragino Maru Gothic ProN","Nunito","Segoe UI",system-ui,sans-serif}
a{color:var(--link);text-underline-offset:.18em}:focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:4px}
.skip{position:absolute;left:-999px;top:8px;background:var(--surface);padding:8px 12px}.skip:focus{left:16px}
.wrap{max-width:960px;margin:0 auto;padding:0 16px}
header.site{border-bottom:1px solid var(--line)}header.site .wrap{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center;justify-content:space-between;padding-top:14px;padding-bottom:14px}
.brand{font-weight:800;font-size:1.15rem;text-decoration:none;color:var(--text)}nav ul{display:flex;flex-wrap:wrap;gap:4px 18px;list-style:none;margin:0;padding:0}
main{padding:28px 0 40px}h1{font-size:clamp(1.8rem,5vw,2.4rem);line-height:1.2;margin:.2em 0 .3em}h2{font-size:1.4rem;margin:2em 0 .5em}h3{font-size:1.1rem;margin:1.5em 0 .4em}
.lead{font-size:1.1rem;color:var(--muted);max-width:44em}.muted{color:var(--muted)}
.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:18px 0}
code,pre,input[type=text],textarea{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.92em}
code{background:var(--code);padding:.1em .35em;border-radius:6px;overflow-wrap:anywhere}pre{background:var(--code);padding:12px 14px;border-radius:10px;overflow-x:auto;margin:0}pre code{padding:0;background:none}
.table{overflow-x:auto}table{border-collapse:collapse;width:100%;margin:8px 0 16px}th,td{text-align:left;vertical-align:top;padding:8px 10px;border-bottom:1px solid var(--line)}
.btn{font:inherit;font-weight:700;color:#3b2418;background:var(--accent);border:0;border-radius:999px;padding:8px 16px;cursor:pointer}
.row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:10px 0}
form.builder{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px 18px}
form.builder label{font-weight:700;display:block;margin-bottom:4px}
form.builder select,form.builder input[type=number]{font:inherit;width:100%;padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--text)}
.out input,.out textarea{width:100%;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--text)}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}.gallery figure{margin:0;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:6px;align-items:flex-start}.gallery img{max-width:100%;height:auto}.gallery figcaption{font-size:.9rem}.btn.small{padding:4px 12px;font-size:.85rem}
.preview{min-height:80px;display:flex;align-items:center;justify-content:center;padding:12px;background:repeating-conic-gradient(var(--code) 0 25%,transparent 0 50%) 0 0/20px 20px;border-radius:12px}.preview img{max-width:100%;height:auto}
footer.site{border-top:1px solid var(--line);padding:24px 0 36px;color:var(--muted);font-size:.92rem}footer.site p{margin:.35em 0}
`;

const COPY_JS = `document.querySelectorAll("[data-copy]").forEach(function(b){b.addEventListener("click",function(){var el=document.getElementById(b.getAttribute("data-copy"));var s=document.getElementById(b.getAttribute("data-status"));var t=el.value!==undefined?el.value:el.textContent;navigator.clipboard.writeText(t).then(function(){s.textContent="Copied."},function(){s.textContent="Copy failed; select the text and copy it manually."})})});`;

function helpPage(origin, noindex) {
  const base = `${origin}/${APP}`;
  const opt = (list) => list.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("");
  const tables = OPTION_GROUPS.map(
    (g) => `<h3>${esc(g.title)}</h3><div class="table"><table><thead><tr><th scope="col">Option</th><th scope="col">Effect</th></tr></thead><tbody>${g.rows
      .map(([k, v]) => `<tr><td>${k.split(", ").map((t) => `<code>${esc(t)}</code>`).join(", ")}</td><td>${esc(v)}</td></tr>`)
      .join("")}</tbody></table></div>`,
  ).join("\n");
  const gallery = ARTS.map(
    (a, i) => `<figure>
<img src="/${APP}/${a.name}" alt="${esc(a.title)}, animated text art" loading="lazy">
<figcaption><strong>${esc(a.title)}</strong> <code id="g${i}">${esc(a.name)}</code><br><span class="muted">${a.tags.map(esc).join(", ")}</span></figcaption>
<div class="row" style="margin:0"><button class="btn small" type="button" data-copy="m${i}" data-status="gs${i}">Copy Markdown</button><span id="gs${i}" role="status" aria-live="polite" class="muted"></span></div>
<input type="hidden" id="m${i}" value="![${esc(a.title)}](${esc(base)}/${a.name})">
</figure>`,
  ).join("\n");
  const body = `
<h1>Animated ASCII art for your profile</h1>
<p class="lead">Small animated kaomoji and text art for GitHub profile READMEs: cats, 2channel classics, Reddit and 4chan memes, cute and gloomy moods. Pick one, copy the Markdown, done.</p>

<section aria-labelledby="gal">
<h2 id="gal">Gallery</h2>
<p>All ${ARTS.length} sets, animating live. Each name is also its URL.</p>
<div class="gallery">
${gallery}
</div>
</section>

<section aria-labelledby="builder">
<h2 id="builder">URL builder</h2>
<noscript><p>The builder needs JavaScript. The option tables below describe everything it does.</p></noscript>
<form class="builder card" id="b">
  <div><label for="art">Art</label><select id="art">${opt([["", "random (default)"], ...TAGS.map((t) => [t, `random from ${t}`]), ...ARTS.map((a) => [a.name, `${a.title} (${a.name})`])])}</select></div>
  <div><label for="daily">Change</label><select id="daily">${opt([["", "every load (default)"], ["daily", "once a day"]])}</select></div>
  <div><label for="size">Font size (12 to 64 px)</label><input id="size" type="number" min="12" max="64" placeholder="22"></div>
  <div><label for="theme">Theme</label><select id="theme">${opt([["", "auto (default)"], ["light", "light"], ["dark", "dark"], ["transparent", "transparent"]])}</select></div>
  <div><label for="color">Color</label><select id="color">${opt([["", "theme (default)"], ["rainbow", "rainbow"], ["color-f08a3c", "orange"], ["color-e91e63", "pink"], ["color-8e6cdf", "lavender"], ["color-2bb3a3", "mint"], ["color-4a90e2", "sky"]])}</select></div>
  <div><label for="border">Border (0 to 8 px)</label><input id="border" type="number" min="0" max="8" placeholder="0"></div>
  <div><label for="speed">Speed (25 to 400 %)</label><input id="speed" type="number" min="25" max="400" step="25" placeholder="100"></div>
  <div><label><input type="checkbox" id="card"> Card background</label><label><input type="checkbox" id="bounce"> Bounce</label><label><input type="checkbox" id="static"> Static</label></div>
</form>
<div class="card out">
  <label for="url"><strong>Image URL</strong></label>
  <input id="url" type="text" readonly value="${esc(base)}">
  <div class="row"><button class="btn" type="button" data-copy="url" data-status="s1">Copy URL</button><span id="s1" role="status" aria-live="polite" class="muted"></span></div>
  <label for="md"><strong>Markdown</strong></label>
  <textarea id="md" rows="3" readonly>![ASCII art](${esc(base)})</textarea>
  <div class="row"><button class="btn" type="button" data-copy="md" data-status="s2">Copy Markdown</button><span id="s2" role="status" aria-live="polite" class="muted"></span></div>
  <p><strong>Preview</strong></p>
  <div class="preview"><img id="pv" src="/${APP}" alt="Preview of the configured art"></div>
</div>
</section>

<section aria-labelledby="opts">
<h2 id="opts">All options</h2>
<p>Options are path segments after <code>${esc(base)}/</code>, in any order. A trailing <code>.svg</code> is allowed. An unknown option renders a small error badge.</p>
${tables}
</section>

<section aria-labelledby="own">
<h2 id="own">Add your own art</h2>
<p>The demo never accepts uploads or custom text. To add your own sets, copy the <a href="${esc(SITE.repository)}">template repository</a>, add entries to the art list and deploy it to your own Cloudflare Pages project.</p>
</section>
`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: SITE.app,
        url: `${base}/help`,
        description: "Animated kaomoji and ASCII art SVGs for GitHub profile READMEs.",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: person(),
        copyrightHolder: person(),
        copyrightYear: SITE.copyrightYear,
        license: "https://www.gnu.org/licenses/agpl-3.0.html",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE.name, item: `${origin}/` },
          { "@type": "ListItem", position: 2, name: "Animated ASCII art", item: `${base}/help` },
        ],
      },
    ],
  };
  const script = `(function(){var base=${jsonLd(base)};var f=document.getElementById("b");function v(id){return document.getElementById(id).value.trim()}function c(id){return document.getElementById(id).checked}function num(id,min,max){var n=parseInt(v(id),10);return isNaN(n)?"":Math.min(max,Math.max(min,n))}function build(){var p=[];["art","daily"].forEach(function(id){var x=v(id);if(x)p.push(x)});var s=num("size",12,64);if(s!=="")p.push("size-"+s);var t=v("theme");if(t)p.push(t);var col=v("color");if(col)p.push(col);if(c("card"))p.push("card");var b=num("border",0,8);if(b!==""&&b>0)p.push("border-"+b);var sp=num("speed",25,400);if(sp!==""&&sp!==100)p.push("speed-"+sp);if(c("bounce"))p.push("bounce");if(c("static"))p.push("static");var url=base+(p.length?"/"+p.join("/"):"");document.getElementById("url").value=url;document.getElementById("md").value="![ASCII art]("+url+")";document.getElementById("pv").src=url.replace(base,"/${APP}")}f.addEventListener("input",build);f.addEventListener("change",build);f.addEventListener("submit",function(e){e.preventDefault()});build()})();` + COPY_JS;

  const title = "Animated ASCII art and kaomoji for GitHub profile READMEs";
  const description = `${ARTS.length} small animated kaomoji and text art SVGs for your GitHub profile: cats, owata, table flip, lenny face, greentext and more. One Markdown line, no sign-up.`;
  const url = `${base}/help`;
  const holder = SITE.copyrightUrl.replace(/^https?:\/\//, "");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(SITE.copyrightHolder)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#fff8f1" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1a1620" media="(prefers-color-scheme: dark)">
<meta name="robots" content="${noindex ? "noindex, nofollow" : "index, follow"}">
<link rel="canonical" href="${esc(url)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M8 6l18 14h12L56 6l-4 30c0 12-9 22-20 22S12 48 12 36z' fill='%23f08a3c'/%3E%3C/svg%3E">
<link rel="alternate" type="text/markdown" href="${esc(base)}/agents" title="Animated ASCII art for AI agents">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<style>${CSS}</style>
<script type="application/ld+json">${jsonLd(ld)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site"><div class="wrap">
<a class="brand" href="/">${esc(SITE.name)}</a>
<nav aria-label="Main"><ul><li><a href="/">Home</a></li><li><a href="/${APP}/help" aria-current="page">ASCII art</a></li><li><a href="/${APP}/agents">For agents</a></li><li><a href="${esc(SITE.repository)}">Source</a></li></ul></nav>
</div></header>
<main id="main" class="wrap" tabindex="-1">
${body}
</main>
<footer class="site"><div class="wrap">
<p><small>&copy; ${esc(SITE.copyrightYear)} <a href="${esc(SITE.copyrightUrl)}" rel="author">${esc(SITE.copyrightHolder)} (${esc(holder)})</a>. Code under <a href="${esc(SITE.repository)}/blob/main/LICENSE" rel="license">AGPL-3.0</a>. The kaomoji and text art are traditional internet folk art, credited to their communities.</small></p>
<p><small>A free demonstration provided as is, without warranty. Not affiliated with GitHub, Cloudflare, Reddit, 4chan or 2channel/5channel. No cookies, no tracking, no uploads. <a href="${esc(SITE.repository)}#disclaimer">Disclaimer</a></small></p>
</div></footer>
<script>${script}</script>
</body>
</html>
`;
  return { html, script };
}

export function agentsMarkdown(origin) {
  const base = `${origin}/${APP}`;
  const groups = OPTION_GROUPS.map(
    (g) => `### ${g.title}\n\n| Token | Meaning |\n|---|---|\n${g.rows.map(([k, v]) => `| ${k.split(", ").map((t) => `\`${t}\``).join(", ")} | ${v} |`).join("\n")}`,
  ).join("\n\n");
  return `# Animated ASCII art: guide for AI agents

© ${SITE.copyrightYear} ${SITE.copyrightHolder} (${SITE.copyrightUrl.replace(/^https?:\/\//, "")}). Code AGPL-3.0-only.

This endpoint returns small animated SVGs of kaomoji and text art (one to three lines) for GitHub profile READMEs and other Markdown. It is configured only by URL path segments. No API keys, no uploads, no custom text, no user data.

## Endpoint

\`\`\`
GET ${base}[/<token>[/<token>...]][.svg]
\`\`\`

- Response: \`image/svg+xml\`, self-contained, animated with CSS (no scripts).
- Header \`X-Ascii-Art\` names the art set that was rendered.
- Tokens are case-insensitive and order-independent; at most 16.
- An unknown token returns HTTP 200 with an error badge and \`X-Ascii-Error: unknown option #N\`.

## Tokens

${groups}

## Art sets

| Name | Title | Tags |
|---|---|---|
${ARTS.map((a) => `| \`${a.name}\` | ${a.title} | ${a.tags.join(", ")} |`).join("\n")}

## Examples

| Goal | URL |
|---|---|
| Random art | ${base} |
| Owata in a card | ${base}/owata/card |
| Random cat, once a day | ${base}/cat/daily |
| Rainbow hug, large | ${base}/hug/rainbow/size-36 |

\`\`\`markdown
![Owata](${base}/owata)
\`\`\`

## Caching

- Named art: cacheable for one day. Random: \`no-store\`. Daily: cacheable until 00:00 UTC.

## Guidance for agents

- Use only the names and tokens listed here; check for the \`X-Ascii-Error\` header.
- Add alt text naming the art when embedding.
- To add custom art, point users to the template repository: ${SITE.repository}
- This is a best-effort free demo without warranty. Do not send automated high-volume traffic.

## More

- Gallery, URL builder and option tables: ${base}/help
- Source, license and disclaimer: ${SITE.repository}
`;
}

async function sha256Base64(text) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(d)));
}

export async function servePage(request, kind) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const url = new URL(request.url);
  const preview = isPreviewHost(url.hostname);
  const headers = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "Cache-Control": "public, max-age=300" };
  if (preview) headers["X-Robots-Tag"] = "noindex, nofollow";
  let body;
  if (kind === "help") {
    const { html, script } = helpPage(url.origin, preview);
    headers["Content-Type"] = "text/html; charset=utf-8";
    headers["Content-Security-Policy"] = `default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'sha256-${await sha256Base64(script)}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
    body = html;
  } else {
    headers["Content-Type"] = "text/markdown; charset=utf-8";
    body = agentsMarkdown(url.origin);
  }
  return new Response(request.method === "HEAD" ? null : body, { headers });
}
