import fs from "node:fs";
const file = process.argv[2];
const names = process.argv.slice(3);
const js = fs.readFileSync(file, "utf-8");

function find(name) {
  const patterns = [
    new RegExp("const\\s+" + name + "\\s*="),
    new RegExp("\\b" + name + "\\s*=\\s*(?:async\\s*)?\\("),
    new RegExp("function\\s+" + name + "\\(")
  ];
  for (const p of patterns) {
    const m = p.exec(js);
    if (!m) continue;
    let i = m.index, depth = 0, started = false;
    while (i < js.length) {
      const ch = js[i];
      if (ch === "{") { depth++; started = true; }
      else if (ch === "}") { depth--; if (started && depth === 0) return js.slice(m.index, i + 1); }
      i++;
    }
  }
  return null;
}

for (const n of names) {
  const out = find(n);
  if (out) {
    console.log("=== " + n + " (" + out.length + " chars) ===");
    console.log(out.slice(0, 2500));
    console.log();
  } else {
    console.log("=== " + n + " NOT FOUND ===");
  }
}
