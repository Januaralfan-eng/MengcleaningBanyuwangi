import fs from "node:fs";
const js = fs.readFileSync("C:/Users/BUMI/mengcleaning-local/dist/public/assets/siteSettings-Yq70opUU.js", "utf-8");

function extractCallable(name) {
  const patterns = [
    new RegExp("function\\s+" + name + "\\("),
    new RegExp("const\\s+" + name + "\\s*="),
    new RegExp("\\b" + name + "\\s*=\\s*function")
  ];
  for (const p of patterns) {
    const m = p.exec(js);
    if (!m) continue;
    let i = m.index;
    let depth = 0;
    let started = false;
    while (i < js.length) {
      const ch = js[i];
      if (ch === "{") { depth++; started = true; }
      else if (ch === "}") { depth--; if (started && depth === 0) return js.slice(m.index, Math.min(i + 1, m.index + 700)); }
      i++;
    }
  }
  return null;
}

for (const name of ["d", "D", "c", "r", "i", "v", "I", "w"]) {
  const out = extractCallable(name);
  if (out) {
    console.log("=== " + name + " ===");
    console.log(out);
    console.log();
  }
}
