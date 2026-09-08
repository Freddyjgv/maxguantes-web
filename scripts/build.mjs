import { readFile, writeFile, mkdir, rm, cp, readdir, stat } from "node:fs/promises";
import { dirname, join, extname } from "node:path";
import {
  renderHome,
  renderProducts,
  renderRequest,
  renderProduct,
  renderCategory,
  renderAbout,
  renderIndustries,
  renderServices,
  renderExport,
  renderResources,
  renderResource,
  renderContact,
  renderPrivacy,
  renderThanks,
  render404,
  site,
  categories,
  resources
} from "../src/render.mjs";

const root = new URL("../", import.meta.url).pathname;
const dist = join(root, "dist");
const dataFile = join(root, "src/data/products.json");

function slugify(value) {
  return String(value || "producto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "producto";
}

function list(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (!value) return [];
  return String(value).split(/\r?\n|;|,|\s*\|\s*/).map(item => item.trim()).filter(Boolean);
}

function categoriesFor(product) {
  const type = slugify(product.tipo || "");
  const text = slugify([product.tipo, product.nombre, product.codigo].filter(Boolean).join(" "));
  const matches = [];
  const add = category => { if (!matches.includes(category)) matches.push(category); };

  // Primero se reconoce la forma del EPP y después los riesgos secundarios.
  if (/proteccion-manual/.test(type) || /guante|proteccion-de-manos/.test(text)) add("proteccion-de-manos");
  if (/retardante-al-fuego/.test(type) || /ignifug|arco-electrico|ropa-fr|vestuario-fr/.test(text)) add("ropa-ignifuga");
  if (/proteccion-respiratoria/.test(type) || /respir|mascar|filtro|cartucho/.test(text)) add("proteccion-respiratoria");
  if (/proteccion-altura/.test(type) || /altura|caida|arnes|linea-de-vida/.test(text)) add("trabajo-en-altura");
  if (/proteccion-para-la-cabeza|proteccion-visual/.test(type) || /cabeza|casco|visual|facial|lente|gafa|visor/.test(text)) add("proteccion-cabeza-visual-facial");
  if (/calzado/.test(type) || /calzado|bota|zapato/.test(text)) add("calzado-de-seguridad");
  if (/proteccion-auditiva/.test(type) || /audit|orejera|tapon/.test(text)) add("proteccion-auditiva");

  return matches.length ? matches : ["proteccion-corporal"];
}

function normalizeProduct(product, index) {
  if (!product.codigo && product.slug && product.sku && product.name) {
    const existingCategories = [...new Set([...list(product.categories), product.category].filter(Boolean))];
    const inferredCategories = categoriesFor({ tipo: product.categoryName || product.category, nombre: product.name, codigo: product.sku });
    const assignedCategories = [...new Set([...existingCategories, ...inferredCategories])];
    const primaryCategory = assignedCategories[0] || "proteccion-corporal";
    return {
      ...product,
      sortOrder: Number.isFinite(Number(product.sortOrder ?? product.orden)) ? Number(product.sortOrder ?? product.orden) : 9999,
      category: primaryCategory,
      categories: assignedCategories,
      categoryName: categories.find(item => item.slug === primaryCategory)?.shortName || product.categoryName || "Protección industrial",
      standards: list(product.standards),
      features: list(product.features),
      materials: list(product.materials),
      variants: list(product.variants)
    };
  }

  const sku = String(product.codigo || product.id || `MG-${index + 1}`).trim();
  const name = String(product.nombre || `Producto ${sku}`).trim();
  const brand = String(product.marca || "Maxguantes").trim();
  const explicitCategories = list(product.categorias).map(value => {
    const normalized = slugify(value);
    return categories.find(item =>
      item.slug === normalized ||
      slugify(item.name) === normalized ||
      slugify(item.shortName) === normalized
    )?.slug;
  }).filter(Boolean);
  const assignedCategories = [...new Set([...explicitCategories, ...categoriesFor(product)])];
  const category = assignedCategories[0];
  const categoryName = categories.find(item => item.slug === category)?.shortName || "Protección industrial";
  const standards = list(product.certificaciones);
  const sheet = String(product.ficha_tecnica || "").trim();
  const suppliedSummary = String(product.descripcion || "").trim();

  return {
    sku,
    slug: slugify(sku),
    name,
    shortName: name,
    brand,
    category,
    categories: assignedCategories,
    categoryName,
    summary: suppliedSummary || `${name} ${brand ? `de ${brand}` : ""} para aplicaciones de protección industrial. Disponibilidad y precio sujetos a confirmación.`,
    description: suppliedSummary || `Solicite la validación técnica de ${name} según la tarea, el riesgo, las cantidades y las condiciones de uso de su empresa. Maxguantes confirma la referencia, documentación, precio y disponibilidad antes de cada pedido.`,
    image: String(product.imagen || "/assets/product-placeholder.svg").trim(),
    technicalSheet: /^(https?:\/\/|\/)/i.test(sheet) ? sheet : "",
    featured: product.destacado === true,
    sortOrder: Number.isFinite(Number(product.orden)) ? Number(product.orden) : 9999,
    published: product.publicado !== false,
    specialOrder: product.pedido_especial === true,
    standards: standards.length ? standards : ["Certificaciones según ficha técnica vigente"],
    features: list(product.caracteristicas).length ? list(product.caracteristicas) : ["Selección sujeta a validación técnica", "Cotización personalizada", "Disponibilidad confirmada manualmente"],
    materials: list(product.materiales).length ? list(product.materiales) : ["Consulte la ficha técnica del fabricante"],
    variants: list(product.variantes).length ? list(product.variantes) : ["Presentaciones, tallas o colores según referencia"],
    seoTitle: String(product.seo_title || "").trim() || `${name} ${sku} en Panamá | Maxguantes`,
    seoDescription: String(product.seo_description || "").trim() || `Cotice ${name} ${sku} de ${brand}. Asesoría técnica, documentación y disponibilidad confirmada por Maxguantes en Panamá.`
  };
}

async function loadProducts() {
  const local = JSON.parse(await readFile(dataFile, "utf8"));
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const view = process.env.SUPABASE_PRODUCTS_VIEW || "catalogo";
  if (!baseUrl || !apiKey) return local.filter(product => product.published !== false);

  try {
    const response = await fetch(`${baseUrl}/rest/v1/${encodeURIComponent(view)}?select=*`, {
      headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` }
    });
    if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error("La respuesta de Supabase no es una lista");
    const normalized = products
      .map(normalizeProduct)
      .filter(product => product.published !== false && product.slug && product.sku && product.name)
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (!normalized.length) throw new Error("Supabase no devolvió productos publicables");
    if (new Set(normalized.map(product => product.slug)).size !== normalized.length) {
      throw new Error("Hay códigos de producto duplicados; cada código debe ser único");
    }
    return normalized;
  } catch (error) {
    console.warn(`Aviso: ${error.message}. Se utilizará el catálogo local.`);
    return local.filter(product => product.published !== false);
  }
}

async function output(path, content) {
  const target = join(dist, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

function xmlEscape(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function sitemap(paths) {
  const modified = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(path => `  <url><loc>${xmlEscape(site.domain + path)}</loc><lastmod>${modified}</lastmod><changefreq>${path.includes("/productos/") ? "weekly" : "monthly"}</changefreq><priority>${path === "/" ? "1.0" : path === "/productos/" ? "0.9" : "0.7"}</priority></url>`).join("\n")}
</urlset>`;
}

function rssFeed() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Recursos técnicos Maxguantes</title><link>${site.domain}/recursos/</link><description>Información práctica sobre EPP y seguridad industrial.</description><language>es-pa</language>${resources.map(resource => `<item><title>${xmlEscape(resource.title)}</title><link>${site.domain}/recursos/${resource.slug}/</link><guid>${site.domain}/recursos/${resource.slug}/</guid><pubDate>${new Date(resource.date + "T12:00:00Z").toUTCString()}</pubDate><description>${xmlEscape(resource.excerpt)}</description></item>`).join("")}</channel></rss>`;
}

function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#0b0d0f"/><path d="M12 16h11l9 19 9-19h11L37 50H27z" fill="#df1f2d"/></svg>`;
}

function webManifest() {
  return JSON.stringify({name:"Maxguantes",short_name:"Maxguantes",description:site.description,start_url:"/",display:"standalone",background_color:"#0b0d0f",theme_color:"#df1f2d",icons:[{src:"/assets/favicon-192x192.png",sizes:"192x192",type:"image/png"}]}, null, 2);
}

function redirects() {
  return `/producto/a780-guante-contra-arco-electrico-ignifugo-y-anticorte /productos/a780/ 301
/ventas-internacionales /exportacion/ 301
/nosotros /nosotros/ 301
/contacto /contacto/ 301
/productos /productos/ 301
/blog /recursos/ 301
/uso-de-ropa-ignifuga-especializada-en-los-sectores-energia-mineria-transporte-de-combustibles-e-industria-offshore /recursos/ropa-ignifuga-industrias-alto-riesgo/ 301
/relacion-entre-empresa-y-proveedor /recursos/seleccionar-proveedor-epp/ 301
/empresa-segura-es-igual-a-empresa-rentable /recursos/seguridad-rentabilidad-empresa/ 301
/recomendaciones-a-la-hora-de-utilizar-guantes-de-seguridad /recursos/seleccion-uso-guantes-seguridad/ 301
/* /404.html 404`;
}

function headers() {
  return `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; form-action 'self'; frame-ancestors 'self'; base-uri 'self'; upgrade-insecure-requests

/assets/*
  Cache-Control: public, max-age=31536000, immutable`;
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, "src/assets"), join(dist, "assets"), { recursive: true });

const products = await loadProducts();
const routes = [];
const sitemapRoutes = [];
const addPage = async (route, file, html, indexable = true) => { await output(file, html); routes.push(route); if (indexable) sitemapRoutes.push(route); };

await addPage("/", "index.html", renderHome(products));
await addPage("/productos/", "productos/index.html", renderProducts(products));
await addPage("/solicitud/", "solicitud/index.html", renderRequest(), false);
await addPage("/nosotros/", "nosotros/index.html", renderAbout());
await addPage("/sectores/", "sectores/index.html", renderIndustries());
await addPage("/servicios/", "servicios/index.html", renderServices());
await addPage("/exportacion/", "exportacion/index.html", renderExport());
await addPage("/recursos/", "recursos/index.html", renderResources());
await addPage("/contacto/", "contacto/index.html", renderContact());
await addPage("/privacidad/", "privacidad/index.html", renderPrivacy());
await addPage("/gracias/", "gracias/index.html", renderThanks(), false);

for (const product of products) {
  await addPage(`/productos/${product.slug}/`, `productos/${product.slug}/index.html`, renderProduct(product, products));
}

for (const category of categories) {
  await addPage(`/categorias/${category.slug}/`, `categorias/${category.slug}/index.html`, renderCategory(category, products), products.some(product => product.categories?.includes(category.slug)));
}

for (const resource of resources) {
  await addPage(`/recursos/${resource.slug}/`, `recursos/${resource.slug}/index.html`, renderResource(resource));
}

await output("404.html", render404());
await output("robots.txt", `User-agent: *\nAllow: /\nDisallow: /gracias/\nDisallow: /solicitud/\nSitemap: ${site.domain}/sitemap.xml\n`);
await output("sitemap.xml", sitemap(sitemapRoutes));
await output("feed.xml", rssFeed());
await output("favicon.svg", favicon());
await output("site.webmanifest", webManifest());
await output("_redirects", redirects());
await output("_headers", headers());

const files = await readdir(dist, { recursive: true });
let bytes = 0;
for (const file of files) {
  const info = await stat(join(dist, file));
  if (info.isFile()) bytes += info.size;
}
console.log(`Maxguantes generado: ${routes.length} rutas, ${products.length} productos, ${(bytes / 1024 / 1024).toFixed(2)} MB.`);
