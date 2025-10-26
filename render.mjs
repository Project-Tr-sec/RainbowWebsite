import path from "path";
import { fileURLToPath } from "url";
import glob from "glob";
import ejs from "ejs";
import fs from "fs/promises";
import fse from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIEWS = path.join(__dirname, "views");
const OUT   = path.join(__dirname, "dist");

// 1) Clean & recreate dist
await fse.remove(OUT);
await fse.ensureDir(OUT);

// 2) Render every .ejs file that is NOT a partial
const files = glob.sync("**/*.ejs", { cwd: VIEWS, nodir: true });

for (const rel of files) {
  const base = path.basename(rel);
  const isPartial = base.startsWith("_") || /(^|\/)(partials|includes)\//.test(rel);
  if (isPartial) continue;

  const src = path.join(VIEWS, rel);
  const outPath = path.join(OUT, rel.replace(/\.ejs$/, ".html"));

  const html = await ejs.renderFile(
    src,
    { site: { title: "My Academy" } }, // pass data here as needed
    { root: VIEWS, async: true }       // enables <%- include('navbar') %>
  );

  await fse.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, html, "utf8");
  console.log("Rendered:", rel, "->", path.relative(__dirname, outPath));
}

// 3) Copy static assets (ignore if missing)
for (const dir of ["assets", "images"]) {
  const from = path.join(__dirname, dir);
  if (await fse.pathExists(from)) {
    await fse.copy(from, path.join(OUT, dir), { overwrite: true });
  }
}
