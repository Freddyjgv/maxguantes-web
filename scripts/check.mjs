import { readFile, readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const files = await readdir(dist, { recursive: true });
const htmlFiles = files.filter(file => file.endsWith(".html"));
const failures = [];
const titles = new Map();
const canonicals = new Map();

for (const file of htmlFiles) {
  const html = await readFile(join(dist, file), "utf8");
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  if (h1Count !== 1) failures.push(`${file}: ${h1Count} etiquetas H1`);
  if (!/<title>[^<]{10,}<\/title>/.test(html)) failures.push(`${file}: título faltante`);
  if (!/<meta name="description" content="[^\"]{70,}/.test(html)) failures.push(`${file}: descripción corta o faltante`);
  if (!/<link rel="canonical"/.test(html)) failures.push(`${file}: canonical faltante`);
  if (!/<html lang="es-PA">/.test(html)) failures.push(`${file}: idioma incorrecto`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (title && titles.has(title)) failures.push(`${file}: título duplicado con ${titles.get(title)}`);
  if (canonical && canonicals.has(canonical)) failures.push(`${file}: canonical duplicado con ${canonicals.get(canonical)}`);
  if (title) titles.set(title, file);
  if (canonical) canonicals.set(canonical, file);
  const refs = [...html.matchAll(/(?:src|href)="(\/(?:assets|favicon)[^\"]*)"/g)].map(match => match[1].split("?")[0]);
  for (const ref of refs) {
    const target = join(dist, ref.replace(/^\//, ""));
    try { await stat(target); } catch { failures.push(`${file}: recurso faltante ${ref}`); }
  }
  const links = [...html.matchAll(/href="(\/[^"]*)"/g)].map(match => match[1].split("#")[0].split("?")[0]).filter(Boolean);
  for (const link of links) {
    if (link.startsWith("/assets/") || link === "/favicon.svg" || link === "/site.webmanifest") continue;
    const relative = link === "/" ? "index.html" : link.endsWith("/") ? `${link.slice(1)}index.html` : link.slice(1);
    try { await stat(join(dist, relative)); } catch { failures.push(`${file}: enlace interno faltante ${link}`); }
  }
}

for (const expected of ["index.html","robots.txt","sitemap.xml","_redirects","_headers","assets/styles.css","assets/site.js"]) {
  try { await stat(join(dist, expected)); } catch { failures.push(`Falta ${expected}`); }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validación correcta: ${htmlFiles.length} páginas HTML.`);
