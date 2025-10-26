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

await fse.remove(OUT);
await fse.ensureDir(OUT);

const files = glob.sync("**/*.ejs", { cwd: VIEWS, nodir: true });

for (const rel of files) {
  const base = path.basename(rel);
  const isPartial = base.startsWith("_") || /(^|\/)(partials|includes)\//.test(rel);
  if (isPartial) continue;

  const src = path.join(VIEWS, rel);
  const outPath = path.join(OUT, rel.replace(/\.ejs$/, ".html"));

  const html = await ejs.renderFile(src, { site: { title: "My Academy" } }, { root: VIEWS, async: true });
  await fse.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, html, "utf8");
}

for (const dir of ["assets", "images"]) {
  const from = path.join(__dirname, dir);
  if (await fse.pathExists(from)) await fse.copy(from, path.join(OUT, dir), { overwrite: true });
}
