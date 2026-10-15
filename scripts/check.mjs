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

try {
  const redirectsText = await readFile(join(dist, "_redirects"), "utf8");
  const redirectLines = redirectsText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));
  const wordpressRedirects = redirectLines.filter(line => line.startsWith("/wp-content/uploads/"));
  const wordpressSources = wordpressRedirects.map(line => line.split(/\s+/)[0]);
  const normalizedWordpressSources = wordpressSources.map(source => encodeURI(decodeURI(source)));
  const unicodeCompatibilityRules = wordpressSources.filter(source => /[^\x00-\x7F]/.test(source));
  if (wordpressRedirects.length !== 287) {
    failures.push(`_redirects: se esperaban 285 rutas canónicas y 2 variantes Unicode; hay ${wordpressRedirects.length} reglas`);
  }
  if (new Set(normalizedWordpressSources).size !== 285) {
    failures.push("_redirects: el conjunto normalizado no contiene exactamente 285 rutas WordPress");
  }
  if (unicodeCompatibilityRules.length !== 2) {
    failures.push(`_redirects: se esperaban 2 variantes Unicode para Netlify Dev y hay ${unicodeCompatibilityRules.length}`);
  }
  for (const line of wordpressRedirects) {
    if (!/^\/wp-content\/uploads\/\S+\s+https:\/\/tgghrbbjxdvklptqzwmi\.supabase\.co\/storage\/v1\/object\/public\/productos\/\S+\s+301!$/.test(line)) {
      failures.push(`_redirects: regla WordPress inválida: ${line}`);
    }
  }
} catch {
  failures.push("No se pudo validar dist/_redirects");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validación correcta: ${htmlFiles.length} páginas HTML.`);
