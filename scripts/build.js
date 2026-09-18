import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`${path.relative(root, src)} -> ${path.relative(root, dest)}`);
}
function transpileFile(src, dest) {
  ensureDir(path.dirname(dest));
  // esbuild per-file transpile JSX -> React.createElement (no bundle, keeps tabs as globals)
  try {
    execSync(`npx --yes esbuild "${src}" --outfile="${dest}" --jsx=transform --jsx-factory=React.createElement --jsx-fragment=React.Fragment --loader:.js=jsx 2>&1`, { stdio: "pipe" });
    console.log(`${path.relative(root, src)} -> ${path.relative(root, dest)} (transpiled)`);
  } catch (e) {
    const out = e.stdout?.toString() || e.message;
    console.error(`esbuild failed for ${src}: ${out.slice(0,500)}`);
    throw e;
  }
}

ensureDir(distDir);

// Walk src: .jsx -> transpile, others -> copy
function walk(srcBase) {
  for (const e of fs.readdirSync(srcBase, { withFileTypes: true })) {
    const srcPath = path.join(srcBase, e.name);
    if (e.isDirectory()) walk(srcPath);
    else if (e.isFile()) {
      const rel = path.relative(srcDir, srcPath);
      let destRel = rel;
      if (destRel.endsWith(".jsx")) destRel = destRel.slice(0, -4) + ".js";
      const destPath = path.join(distDir, destRel);
      if (srcPath.endsWith(".jsx")) transpileFile(srcPath, destPath);
      else copyFile(srcPath, destPath);
    }
  }
}
walk(srcDir);

for (const name of ["icon-192.png", "icon-512.png", "Finance_Tracker_Pro.xlsx", "manifest.json"]) {
  const src = path.join(root, name);
  if (fs.existsSync(src)) copyFile(src, path.join(distDir, name));
}
console.log("build done — dist ready");
// ponytail: per-file esbuild transpile (JSX->createElement), upgrade ke bundle + minify bila perlu code-split
