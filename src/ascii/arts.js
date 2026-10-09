// SPDX-FileCopyrightText: 2026 Aesthetic Vulpes (github.com/didvc)
// SPDX-License-Identifier: AGPL-3.0-only
// The art collection. Each set: name (URL slug), title, tags, frames (1 to 3 lines each),
// either ms (same duration per frame) or d (duration per frame, ms), optional align ("left" keeps
// spaces exact for monospace motion) and color (default text color, hex without #).
// The kaomoji and text art here are traditional internet folk art; see NOTICE.

const typing = (lines, perChar = 90, hold = 2200) => {
  const frames = [], d = [];
  lines.forEach((line, li) => {
    for (let n = 1; n <= line.length; n++) {
      frames.push(lines.map((l, j) => (j < li ? l : j === li ? line.slice(0, n) : "")));
      d.push(perChar);
    }
  });
  d[d.length - 1] = hold;
  return { frames, d };
};
const walk = (sprite, steps, gap = 2) => ({
  frames: Array.from({ length: steps }, (_, i) => [" ".repeat(i * gap) + sprite + " ".repeat((steps - 1 - i) * gap)]),
});

export const TAGS = ["kawaii", "meme", "cat", "yami", "reddit", "4chan", "2ch"];

export const ARTS = [
  { name: "owata", title: "Owata", tags: ["2ch", "meme"], ms: 450, frames: [["＼(^o^)／", "｜　｜", "ノ　ノ"], ["ヽ(^o^)ノ", "｜　｜", "＞　＜"]] },
  { name: "table-flip", title: "Table flip", tags: ["meme", "2ch", "reddit"], d: [900, 450, 1400, 1100], frames: [["(°-°)  ┬─┬"], ["(╯°□°)╯ ┬─┬"], ["(╯°□°)╯︵ ┻━┻"], ["┬─┬ノ( º _ ºノ)"]] },
  { name: "shrug", title: "Shrug", tags: ["reddit", "meme"], ms: 700, frames: [["¯\\_(ツ)_/¯"], ["_/¯(ツ)¯\\_"]] },
  { name: "lenny", title: "Lenny face", tags: ["reddit", "4chan", "meme"], d: [1600, 400], frames: [["( ͡° ͜ʖ ͡°)"], ["( ͡~ ͜ʖ ͡°)"]] },
  { name: "disapproval", title: "Look of disapproval", tags: ["reddit", "meme"], d: [2000, 200], frames: [["ಠ_ಠ"], ["-_-"]] },
  { name: "finger-guns", title: "Finger guns", tags: ["reddit", "meme"], ms: 500, frames: [["(☞ﾟヮﾟ)☞"], ["☜(ﾟヮﾟ☜)"]] },
  { name: "cat-face", title: "Cat face", tags: ["cat", "kawaii"], d: [2200, 180], frames: [[" /\\_/\\ ", "( o.o )", " > ^ < "], [" /\\_/\\ ", "( -.- )", " > ^ < "]] },
  { name: "cat-paw", title: "Cat paws", tags: ["cat", "kawaii"], d: [1800, 200], frames: [["ฅ^•ﻌ•^ฅ"], ["ฅ^-ﻌ-^ฅ"]] },
  { name: "cat-walk", title: "Walking cat", tags: ["cat"], ms: 260, align: "left", ...walk("=^..^=", 8) },
  { name: "neko-love", title: "Neko love", tags: ["cat", "kawaii"], d: [700, 500, 1400], frames: [["(=^･ω･^=)"], ["(=^･ω･^=)ﾉ"], ["(=^･ω･^=)ﾉ♡"]] },
  { name: "bear", title: "Dancing bear", tags: ["kawaii"], ms: 450, frames: [["ʕ•ᴥ•ʔ"], ["ʕ•ᴥ•ʔノ"], ["ヽʕ•ᴥ•ʔノ"], ["ʕ-ᴥ-ʔ"]] },
  { name: "hug", title: "Hug", tags: ["kawaii"], d: [800, 800, 1400], frames: [["(っ´▽｀)っ"], ["⊂(´▽｀⊂)"], ["(っ´▽｀)っ♡"]] },
  { name: "wave", title: "Hello wave", tags: ["kawaii"], ms: 420, frames: [["ヾ(＾∇＾)"], ["(＾∇＾)ﾉ"]] },
  { name: "kitsune", title: "Kitsune", tags: ["kawaii"], d: [600, 600, 600, 160], frames: [[" /\\_/\\  ", "( ^.^ )~", " > v <  "], [" /\\_/\\  ", "( ^.^ )ﾉ", " > v <  "], [" /\\_/\\  ", "( ^.^ )~", " > v <  "], [" /\\_/\\  ", "( -.- )~", " > v <  "]] },
  { name: "kita", title: "Kita", tags: ["2ch", "meme"], d: [380, 380, 1300], frames: [["ｷﾀ━(ﾟ∀ﾟ)━!"], ["ｷﾀ━━(ﾟ∀ﾟ)━━!!"], ["ｷﾀ━━━(ﾟ∀ﾟ)━━━!!!"]] },
  { name: "mona", title: "Mona", tags: ["2ch"], d: [1800, 300], frames: [["∧＿∧", "（　´∀｀）", "（　　　　）"], ["∧＿∧", "（　´ー｀）", "（　　　　）"]] },
  { name: "giko", title: "Giko", tags: ["2ch", "cat"], ms: 900, frames: [["∧∧", "(ﾟДﾟ)"], ["∧∧", "(ﾟДﾟ)ﾊｧ?"]] },
  { name: "shobon", title: "Shobon in the rain", tags: ["2ch", "yami"], ms: 350, frames: [[" '  .  ' ", "(´・ω・`)"], [" .  '  . ", "(´・ω・`)"]] },
  { name: "orz", title: "orz", tags: ["2ch", "meme"], ms: 700, frames: [["orz"], ["_|￣|○"], ["OTL"]] },
  { name: "fuun", title: "Fuun", tags: ["2ch"], d: [1200, 1200], frames: [["( ´_ゝ｀)"], ["( ´_ゝ｀)ﾌｰﾝ"]] },
  { name: "greentext", title: "Greentext", tags: ["4chan"], align: "left", color: "789922", ...typing([">be me", ">make profile cute"]) },
  { name: "smug", title: "Smug", tags: ["4chan", "meme"], ms: 900, frames: [["( ≖‿≖)"], ["(¬‿¬ )"]] },
  { name: "pien", title: "Pien", tags: ["yami", "kawaii"], d: [900, 900, 1200], frames: [["(｡•́︿•̀｡)"], ["(｡•́︿•̀｡) ぴえん"], ["(ᗒᗣᗕ)՞ ぱおん"]] },
  { name: "tears", title: "Tears", tags: ["yami"], d: [1000, 900], frames: [["(´；ω；｀)"], ["(´；ω；｀)ﾌﾞﾜｯ"]] },
  { name: "suya", title: "Sleepy", tags: ["kawaii", "yami"], ms: 520, frames: [["( ˘ω˘ )"], ["( ˘ω˘ )z"], ["( ˘ω˘ )zZ"], ["( ˘ω˘ )zZz"]] },
  { name: "peek", title: "Peeking", tags: ["meme", "2ch"], align: "left", d: [700, 300, 700, 900, 300, 600], frames: [["|"], ["|ω･)"], ["|･ω･)"], ["|･ω･)ﾉ"], ["|ω･)"], ["|"]] },
  { name: "bunny", title: "Bunny gift", tags: ["kawaii", "meme"], d: [1200, 1500], frames: [["(\\_/)", "( •_•)", "/ >   "], ["(\\_/)", "( •_•)", "/ >♡  "]] },
  { name: "uwu", title: "UwU", tags: ["kawaii", "meme"], ms: 600, frames: [["UwU"], ["OwO"], ["^w^"]] },
  { name: "disco", title: "Disco", tags: ["kawaii"], ms: 400, frames: [["♪┏(・o･)┛♪"], ["♪┗(・o･)┓♪"]] },
  { name: "inu", title: "Puppy", tags: ["kawaii"], ms: 380, frames: [["∪･ω･∪"], ["∪･ω･∪ﾉ"]] },
];
