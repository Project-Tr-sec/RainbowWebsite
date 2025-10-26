// render.mjs
import * as path from "path";
import { fileURLToPath } from "url";
import { globSync } from "glob";
import ejs from "ejs";
import fs from "fs/promises";
import fse from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT  = __dirname;
const VIEWS = path.join(ROOT, "views");
const OUT   = path.join(ROOT, "dist");

// 0) Ensure views exists
if (!(await fse.pathExists(VIEWS))) {
  console.error("ERROR: 'views/' folder not found. Move your .ejs files from 'dist/' into 'views/'.");
  process.exit(1);
}

// 1) Clean & recreate dist
await fse.remove(OUT);
await fse.ensureDir(OUT);

// 2) Render every .ejs file that is NOT a partial (name starts with "_")
const files = globSync("**/*.ejs", { cwd: VIEWS, nodir: true });

for (const rel of files) {
  const base = path.basename(rel);
  const isPartial =
    base.startsWith("_") || /(^|\/)(partials|includes)\//.test(rel);
  if (isPartial) continue;

  const src = path.join(VIEWS, rel);
  const outPath = path.join(OUT, rel.replace(/\.ejs$/, ".html"));

  const html = await ejs.renderFile(
    src,
    { site: { title: "My Academy" } }, // pass data here if you need
    { root: VIEWS, async: true, filename: src } // filename helps with relative includes
  );

  await fse.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, html, "utf8");
  console.log("Rendered:", rel, "→", path.relative(ROOT, outPath));
}

// 3) Copy static assets
for (const dir of ["assets", "images"]) {
  const from = path.join(ROOT, dir);
  if (await fse.pathExists(from)) {
    await fse.copy(from, path.join(OUT, dir), { overwrite: true });
    console.log("Copied:", dir, "→ dist/" + dir);
  }
}

// 4) Copy root files that Pages needs (if they exist)
for (const fname of [".nojekyll", "CNAME", "404.html", "favicon.ico"]) {
  const from = path.join(ROOT, fname);
  if (await fse.pathExists(from)) {
    await fse.copy(from, path.join(OUT, fname), { overwrite: true });
    console.log("Copied:", fname, "→ dist/" + fname);
  }
}
