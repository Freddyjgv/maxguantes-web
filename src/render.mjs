import { site, categories, industries, brands, resources } from "./config.mjs";

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const absoluteUrl = (value = "") => /^https?:\/\//i.test(value) ? value : `${site.domain}${value}`;

const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

const navItems = [
  ["/", "Inicio", "home"],
  ["/productos/", "Productos", "products"],
  ["/soluciones/", "Soluciones", "solutions"],
  ["/sectores/", "Industrias", "industries"],
  ["/nosotros/", "Nosotros", "about"],
  ["/recursos/", "Recursos", "resources"],
  ["/contacto/", "Contacto", "contact"]
];

const whatsappUrl = (message = "Hola Maxguantes, deseo solicitar información sobre equipos de protección personal.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": `${site.domain}/#organization`,
  name: site.name,
  url: site.domain,
  logo: `${site.domain}/assets/logo.webp`,
  foundingDate: site.founded,
  description: site.description,
  telephone: site.phone,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "PH Riverside, planta baja, local 04",
    addressLocality: site.city,
    addressCountry: "PA"
  },
  areaServed: ["PA", "Latin America"]
};

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.domain}${item.path}`
    }))
  };
}

function header(active) {
  return `
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    <header class="site-header" data-header>
      <div class="container header-inner">
        <a class="brand" href="/" aria-label="Maxguantes, inicio">
          <img src="/assets/logo.webp" width="255" height="54" alt="Maxguantes">
        </a>
        <nav class="nav" id="main-navigation" aria-label="Navegación principal">
          ${navItems.map(([href, label, key]) => `<a href="${href}"${active === key ? ' class="active" aria-current="page"' : ""}>${label}</a>`).join("")}
        </nav>
        <div class="header-actions">
          <button class="quote-button" type="button" data-open-quote>Solicitar cotización <span class="quote-count" aria-label="productos agregados">0</span></button>
          <button class="menu-toggle" type="button" aria-controls="main-navigation" aria-expanded="false" aria-label="Abrir menú"><span></span><span></span><span></span></button>
        </div>
      </div>
    </header>`;
}

function footer() {
  return `
    <section class="cta-band" aria-labelledby="cta-title">
      <div class="container cta-inner">
        <div><span class="eyebrow light">Atención técnica B2B</span><h2 id="cta-title">Envíenos su requisición. Nosotros organizamos la solución.</h2></div>
        <div class="button-row"><button class="btn btn-white" type="button" data-open-quote>Iniciar solicitud</button><a class="btn btn-outline" href="${whatsappUrl()}" target="_blank" rel="noopener">WhatsApp</a></div>
      </div>
    </section>
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand"><img src="/assets/logo.webp" width="255" height="54" alt="Maxguantes"><p>${site.description}</p><p class="footer-note">Precio y disponibilidad sujetos a confirmación.</p></div>
          <div><h2 class="footer-title">Productos</h2><div class="footer-links">${categories.slice(0,5).map(c => `<a href="/categorias/${c.slug}/">${c.shortName}</a>`).join("")}</div></div>
          <div><h2 class="footer-title">Empresa</h2><div class="footer-links"><a href="/nosotros/">Nosotros</a><a href="/servicios/">Servicios</a><a href="/exportacion/">Ventas internacionales</a><a href="/recursos/">Recursos técnicos</a><a href="/privacidad/">Privacidad</a></div></div>
          <div><h2 class="footer-title">Contacto</h2><div class="footer-links"><a href="tel:${site.phone}">${site.phoneDisplay}</a><a href="${whatsappUrl()}" target="_blank" rel="noopener">WhatsApp ${site.whatsappDisplay}</a><a href="mailto:${site.email}">${site.email}</a><span>${site.address}</span><span>${site.hours}</span></div></div>
        </div>
        <div class="footer-bottom"><span>© ${new Date().getUTCFullYear()} Maxguantes. Todos los derechos reservados.</span><span>Panamá · Atención a empresas y proyectos</span></div>
      </div>
    </footer>
    <a class="whatsapp-float" href="${whatsappUrl()}" target="_blank" rel="noopener" aria-label="Contactar a Maxguantes por WhatsApp"><span aria-hidden="true">WA</span><b>WhatsApp</b></a>
    ${quoteDrawer()}`;
}

function quoteDrawer() {
  return `
    <div class="quote-overlay" data-close-quote></div>
    <aside class="quote-panel" aria-label="Solicitud de cotización" aria-hidden="true">
      <div class="quote-head"><div><span class="eyebrow">Solicitud B2B</span><h2>Productos a cotizar</h2></div><button class="close-drawer" type="button" data-close-quote aria-label="Cerrar panel">×</button></div>
      <div class="quote-items" aria-live="polite"></div>
      <form class="quote-form" name="solicitud-cotizacion" method="POST" action="/gracias/" data-netlify="true" netlify-honeypot="bot-field" data-quote-form>
        <input type="hidden" name="form-name" value="solicitud-cotizacion">
        <input type="hidden" name="productos" value="" data-quote-products>
        <p class="hidden-field"><label>No complete este campo: <input name="bot-field"></label></p>
        <div class="field-grid"><label>Empresa *<input name="empresa" autocomplete="organization" required></label><label>Nombre *<input name="nombre" autocomplete="name" required></label></div>
        <div class="field-grid"><label>Correo *<input type="email" name="email" autocomplete="email" required></label><label>Teléfono / WhatsApp *<input type="tel" name="telefono" autocomplete="tel" required></label></div>
        <div class="field-grid"><label>Cantidad o alcance<input name="cantidad" placeholder="Ej.: 40 unidades por talla"></label><label>Fecha requerida<input type="date" name="fecha_requerida"></label></div>
        <label>Información adicional<textarea name="mensaje" rows="3" placeholder="Riesgo, norma, tallas, lugar de entrega u otra condición"></textarea></label>
        <label class="check-field"><input type="checkbox" name="privacidad" required><span>Acepto el tratamiento de mis datos para atender esta solicitud.</span></label>
        <button class="btn btn-primary btn-block" type="submit">Enviar solicitud</button>
        <p class="form-disclaimer">La solicitud no constituye una orden. Precio, plazo y disponibilidad serán confirmados por nuestro equipo.</p>
      </form>
    </aside>
    <div class="toast" role="status" aria-live="polite"></div>`;
}

function layout({title, description, path, active, content, schemas = [], bodyClass = "", keywords = "", robots = "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"}) {
  const canonical = `${site.domain}${path}`;
  const allSchemas = [organizationSchema, ...schemas];
  const ga4 = /^G-[A-Z0-9]+$/i.test(process.env.GA4_MEASUREMENT_ID || "") ? process.env.GA4_MEASUREMENT_ID : "";
  const searchVerification = process.env.GOOGLE_SITE_VERIFICATION || "";
  return `<!doctype html>
<html lang="es-PA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : ""}
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#0b0d0f">
  ${searchVerification ? `<meta name="google-site-verification" content="${esc(searchVerification)}">` : ""}
  <link rel="manifest" href="/site.webmanifest">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="es-PA" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_PA">
  <meta property="og:site_name" content="Maxguantes">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/assets/styles.css" as="style">
  <link rel="stylesheet" href="/assets/styles.css">
  <script defer src="/assets/site.js"></script>
  ${ga4 ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(ga4)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(ga4)}',{anonymize_ip:true});</script>` : ""}
  ${allSchemas.map(schema => `<script type="application/ld+json">${json(schema)}</script>`).join("\n  ")}
</head>
<body class="${bodyClass}">
  ${header(active)}
  <main id="contenido">${content}</main>
  ${footer()}
</body>
</html>`;
}

function eyebrow(text, light = false) {
  return `<span class="eyebrow${light ? " light" : ""}">${text}</span>`;
}

function pageHero({eyebrowText, title, intro, breadcrumb = []}) {
  return `<section class="page-hero"><div class="container">
    ${breadcrumb.length ? `<nav class="breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a>${breadcrumb.map((b, i) => `<span>/</span>${b.path && i < breadcrumb.length - 1 ? `<a href="${b.path}">${b.name}</a>` : `<span aria-current="page">${b.name}</span>`}`).join("")}</nav>` : ""}
    ${eyebrow(eyebrowText, true)}<h1>${title}</h1><p>${intro}</p>
  </div></section>`;
}

function categoryCards() {
  return `<div class="category-grid">${categories.map(c => `<a class="category-card" href="/categorias/${c.slug}/"><div class="category-image"><img src="${c.image}" width="92" height="92" loading="lazy" alt="${esc(c.name)}"></div><div class="category-content"><h3>${c.name}</h3><p>${c.description}</p><span class="card-link">Explorar categoría →</span></div></a>`).join("")}</div>`;
}

function productCard(product) {
  return `<article class="product-card" data-product-card data-name="${esc(product.name.toLowerCase())}" data-sku="${esc(product.sku.toLowerCase())}" data-category="${esc(product.category)}" data-brand="${esc((product.brand || "").toLowerCase())}">
    <a class="product-visual" href="/productos/${product.slug}/"><span class="product-status">${product.specialOrder ? "Pedido especial" : "Consultar disponibilidad"}</span><img src="${esc(product.image)}" width="700" height="700" loading="lazy" alt="${esc(product.name)}"></a>
    <div class="product-body"><span class="product-code">${esc(product.sku)} · ${esc(product.brand || "Maxguantes")}</span><h3><a href="/productos/${product.slug}/">${esc(product.name)}</a></h3><p>${esc(product.summary)}</p><div class="product-actions"><button class="btn btn-dark add-quote" type="button" data-code="${esc(product.sku)}" data-name="${esc(product.shortName || product.name)}" data-image="${esc(product.image)}">Agregar a solicitud</button><a class="icon-button" href="/productos/${product.slug}/" aria-label="Ver ${esc(product.name)}">→</a></div></div>
  </article>`;
}

function emptyCatalog() {
  return `<div class="catalog-empty"><span class="category-symbol">+</span><h3>Catálogo en preparación</h3><p>Podemos localizar o cotizar referencias que todavía no aparecen publicadas. Envíenos el SKU, la marca, la norma o su requisición.</p><button class="btn btn-primary" type="button" data-open-quote>Solicitar producto</button></div>`;
}

export function renderHome(products) {
  const featured = products.filter(p => p.featured).slice(0,3);
  const schema = {"@context":"https://schema.org","@type":"WebSite","@id":`${site.domain}/#website`,url:site.domain,name:site.name,description:site.description,inLanguage:"es-PA",publisher:{"@id":`${site.domain}/#organization`}};
  const content = `
    <section class="hero">
      <img class="hero-bg" src="/assets/hero-industrial.webp" width="1800" height="1200" fetchpriority="high" alt="Profesional industrial con equipo de protección personal">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="container hero-content"><div class="hero-copy">${eyebrow("Seguridad industrial B2B · Panamá", true)}<h1 class="display">Protección certificada.<br><span>Respuesta inmediata.</span></h1><p class="hero-lead">Equipos de protección personal para operaciones exigentes. Especialistas en ropa ignífuga, arco eléctrico, guantes técnicos y dotaciones industriales.</p><div class="button-row"><a class="btn btn-primary" href="/productos/">Explorar productos →</a><button class="btn btn-outline" type="button" data-open-quote>Solicitar cotización</button></div></div></div>
      <div class="hero-proof"><div class="container proof-grid"><div class="proof-item"><strong>Desde 2015</strong><span>Experiencia en suministro industrial</span></div><div class="proof-item"><strong>Documentación</strong><span>Normas y fichas por referencia</span></div><div class="proof-item"><strong>Atención B2B</strong><span>Compras, operaciones y HSE</span></div><div class="proof-item"><strong>Panamá + exportación</strong><span>Proyectos locales e internacionales</span></div></div></div>
    </section>
    <section class="section"><div class="container"><div class="section-head"><div>${eyebrow("Encuentre lo correcto más rápido")}<h2 class="section-title">Protección organizada<br>por necesidad.</h2><p class="section-intro">Navegue por categoría, riesgo o aplicación. Cada ficha está diseñada para facilitar la revisión técnica y la solicitud de cotización.</p></div><a class="text-link" href="/productos/">Ver catálogo completo</a></div>${categoryCards()}</div></section>
    <section class="risk-band"><div class="container risk-layout"><div class="risk-copy">${eyebrow("Asesoría para reducir errores", true)}<h2 class="section-title">Busque por riesgo.<br>No solo por producto.</h2><p>Traducimos su operación, matriz de riesgos o especificación técnica en una selección compatible y documentada para revisión de su responsable de seguridad.</p><a class="btn btn-primary" href="/soluciones/">Conocer soluciones</a></div><div class="risk-list">${["Arco eléctrico","Fuego y calor","Corte y abrasión","Riesgo químico","Caídas de altura","Gases y partículas"].map((r,i)=>`<a class="risk-item" href="/soluciones/#riesgo-${i+1}"><span>0${i+1}</span><b>${r}</b><em>→</em></a>`).join("")}</div></div></section>
    <section class="section"><div class="container"><div class="section-head"><div>${eyebrow("Selección técnica")}<h2 class="section-title">Productos destacados.</h2><p class="section-intro">Referencias de muestra mientras incorporamos el catálogo completo desde Supabase.</p></div><a class="text-link" href="/productos/">Ver productos</a></div>${featured.length ? `<div class="product-grid">${featured.map(productCard).join("")}</div>` : emptyCatalog()}</div></section>
    <section class="section process"><div class="container">${eyebrow("Un proceso pensado para compras B2B")}<h2 class="section-title">De la necesidad a la<br>cotización, sin fricción.</h2><div class="steps"><article class="step"><span>01</span><h3>Comparta el requerimiento</h3><p>Busque referencias o envíenos su lista, cantidades, tallas y fecha requerida.</p></article><article class="step"><span>02</span><h3>Validamos la información</h3><p>Revisamos aplicación, normas, alternativas y disponibilidad con usted.</p></article><article class="step"><span>03</span><h3>Reciba la propuesta</h3><p>Preparamos la cotización según las condiciones comerciales de su empresa.</p></article></div></div></section>
    <section class="section story-preview"><div class="container split-layout"><div class="image-frame"><img src="/assets/about-team.webp" width="1800" height="1200" loading="lazy" alt="Equipo técnico revisando una selección de equipos de protección personal"></div><div class="split-copy">${eyebrow("Empresa panameña")}<h2 class="section-title">Una década resolviendo necesidades de protección.</h2><p>Maxguantes nació en Panamá en 2015 para atender empresas que necesitan más que una lista de productos: respuesta, documentación y acompañamiento en la selección.</p><div class="metric-row"><div><strong>2015</strong><span>Año de fundación</span></div><div><strong>B2B</strong><span>Atención especializada</span></div><div><strong>LATAM</strong><span>Alcance comercial</span></div></div><a class="text-link" href="/nosotros/">Conozca nuestra historia</a></div></div></section>
    <section class="section-sm brands-section"><div class="container"><div class="section-head compact"><div>${eyebrow("Marcas disponibles")}<h2>Fabricantes reconocidos.</h2></div><p>La disponibilidad y condición de distribución se valida para cada requerimiento.</p></div><div class="brand-strip">${brands.map(b=>`<span>${b}</span>`).join("")}</div></div></section>`;
  return layout({title:"Maxguantes | Equipos de protección personal en Panamá",description:"EPP certificado para empresas: ropa ignífuga, arco eléctrico, guantes, respiración, altura y dotaciones industriales en Panamá.",path:"/",active:"home",content,schemas:[schema],keywords:"equipos de protección personal Panamá, EPP Panamá, seguridad industrial"});
}

export function renderProducts(products) {
  const content = `${pageHero({eyebrowText:"Catálogo técnico",title:"Equipos de protección personal para cada riesgo.",intro:"Explore las referencias publicadas o envíenos el SKU, la marca, la norma o su requisición. Precio y disponibilidad se confirman para cada cliente.",breadcrumb:[{name:"Productos"}]})}
    <section class="catalog-tools"><div class="container tools-inner"><label class="search-box"><span class="sr-only">Buscar productos</span><input type="search" placeholder="Buscar por producto, SKU, marca o aplicación" data-product-search></label><span class="tool-status" data-result-count>${products.length} productos publicados</span></div></section>
    <section class="section"><div class="container catalog-layout"><aside class="filter-panel" aria-label="Filtrar catálogo"><h2>Filtrar por categoría</h2><button class="filter-chip active" type="button" data-filter="all">Todas <span>${products.length}</span></button>${categories.map(c=>`<button class="filter-chip" type="button" data-filter="${c.slug}">${c.shortName}<span>${products.filter(p=>p.category===c.slug).length}</span></button>`).join("")}<div class="catalog-help"><strong>¿No aparece?</strong><p>Trabajamos con catálogos especiales y referencias bajo pedido.</p><button class="text-link button-link" type="button" data-open-quote>Enviar requisición</button></div></aside><div><div class="catalog-topline"><p>Contenido técnico preparado para cotización B2B.</p><a href="/contacto/" class="text-link">Solicitar asesoría</a></div><div class="product-grid catalog-grid" data-product-grid>${products.map(productCard).join("")}</div><div class="no-results" hidden data-no-results><h2>No encontramos coincidencias.</h2><p>Pruebe con otra palabra o envíenos la referencia para localizarla.</p><button class="btn btn-primary" type="button" data-open-quote>Solicitar producto</button></div></div></div></section>`;
  const schema = {"@context":"https://schema.org","@type":"CollectionPage",name:"Catálogo de equipos de protección personal",url:`${site.domain}/productos/`,description:"Catálogo técnico de EPP de Maxguantes"};
  return layout({title:"Catálogo de EPP certificado | Maxguantes Panamá",description:"Catálogo de equipos de protección personal para empresas: ropa ignífuga, guantes, respiradores, protección visual, altura y calzado.",path:"/productos/",active:"products",content,schemas:[schema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Productos",path:"/productos/"}])],keywords:"catálogo EPP Panamá, equipos de seguridad industrial, cotizar EPP"});
}

export function renderProduct(product, products) {
  const related = products.filter(p => p.slug !== product.slug && p.category === product.category).slice(0,3);
  const productSchema = {"@context":"https://schema.org","@type":"Product",name:product.name,sku:product.sku,brand:{"@type":"Brand",name:product.brand},category:product.categoryName,description:product.summary,image:absoluteUrl(product.image),url:`${site.domain}/productos/${product.slug}/`};
  const content = `<section class="product-detail"><div class="container"><nav class="breadcrumb dark" aria-label="Migas de pan"><a href="/">Inicio</a><span>/</span><a href="/productos/">Productos</a><span>/</span><a href="/categorias/${product.category}/">${esc(product.categoryName)}</a><span>/</span><span aria-current="page">${esc(product.sku)}</span></nav><div class="product-detail-grid"><div class="product-gallery"><span class="product-status">${product.specialOrder ? "Pedido especial" : "Consultar disponibilidad"}</span><img src="${esc(product.image)}" width="900" height="900" fetchpriority="high" alt="${esc(product.name)}"></div><div class="product-summary">${eyebrow(`${esc(product.brand)} · ${esc(product.sku)}`, true)}<h1>${esc(product.name)}</h1><p class="product-lead">${esc(product.summary)}</p><div class="notice"><strong>Cotización personalizada</strong><span>No mostramos precio ni inventario. Confirmamos ambos según el cliente, cantidad y fecha requerida.</span></div><button class="btn btn-primary btn-large add-quote" type="button" data-code="${esc(product.sku)}" data-name="${esc(product.shortName || product.name)}" data-image="${esc(product.image)}">Agregar a solicitud</button><a class="btn btn-outline" href="${whatsappUrl(`Hola Maxguantes, deseo cotizar el producto ${product.sku} - ${product.name}.`)}" target="_blank" rel="noopener">Consultar por WhatsApp</a></div></div></div></section>
    <section class="section"><div class="container detail-columns"><div class="prose"><h2>Descripción</h2><p>${esc(product.description)}</p><h2>Características</h2><ul class="check-list">${product.features.map(f=>`<li>${esc(f)}</li>`).join("")}</ul><h2>Materiales y variantes</h2><p>${esc(product.materials.join(", "))}.</p><ul>${product.variants.map(v=>`<li>${esc(v)}</li>`).join("")}</ul></div><aside class="spec-card"><span class="eyebrow">Documentación técnica</span><h2>Normas y referencias</h2><ul>${product.standards.map(s=>`<li>${esc(s)}</li>`).join("")}</ul><p>Las normas y el desempeño deben verificarse contra la ficha vigente del fabricante antes de aprobar una aplicación.</p>${product.technicalSheet ? `<a class="btn btn-outline" href="${esc(product.technicalSheet)}" target="_blank" rel="noopener">Abrir ficha técnica</a>` : `<button class="text-link button-link" type="button" data-open-quote>Solicitar ficha técnica</button>`}</aside></div></section>
    ${related.length ? `<section class="section related"><div class="container"><div class="section-head"><div>${eyebrow("Misma categoría")}<h2 class="section-title">Productos relacionados.</h2></div><a class="text-link" href="/categorias/${product.category}/">Ver categoría</a></div><div class="product-grid">${related.map(productCard).join("")}</div></div></section>` : ""}`;
  return layout({title:product.seoTitle || `${product.name} | Maxguantes`,description:product.seoDescription || product.summary,path:`/productos/${product.slug}/`,active:"products",content,schemas:[productSchema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Productos",path:"/productos/"},{name:product.categoryName,path:`/categorias/${product.category}/`},{name:product.sku,path:`/productos/${product.slug}/`}])],bodyClass:"product-page"});
}

export function renderCategory(category, products) {
  const filtered = products.filter(p => p.category === category.slug);
  const content = `${pageHero({eyebrowText:`Categoría · ${category.code}`,title:category.name,intro:category.description,breadcrumb:[{name:"Productos",path:"/productos/"},{name:category.shortName}]})}<section class="section"><div class="container"><div class="category-intro"><div><h2>Selección según su aplicación</h2><p>Indique tarea, riesgo, norma, cantidad, tallas y fecha requerida. Nuestro equipo confirmará alternativas, precio y disponibilidad.</p></div><ul>${category.risks.map(r=>`<li>${r}</li>`).join("")}</ul></div>${filtered.length ? `<div class="product-grid">${filtered.map(productCard).join("")}</div>` : emptyCatalog()}</div></section>`;
  const schema = {"@context":"https://schema.org","@type":"CollectionPage",name:category.name,description:category.description,url:`${site.domain}/categorias/${category.slug}/`,isPartOf:{"@id":`${site.domain}/#website`}};
  return layout({title:`${category.name} en Panamá | Maxguantes`,description:`${category.description} Solicite asesoría técnica y cotización para su empresa o proyecto.`,path:`/categorias/${category.slug}/`,active:"products",content,schemas:[schema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Productos",path:"/productos/"},{name:category.shortName,path:`/categorias/${category.slug}/`}])],keywords:category.keywords,robots:filtered.length ? undefined : "noindex,follow"});
}

export function renderAbout() {
  const content = `${pageHero({eyebrowText:"Nuestra empresa",title:"Seguridad industrial con criterio técnico y respuesta comercial.",intro:"Empresa panameña fundada en 2015 para ayudar a organizaciones y proyectos a identificar, cotizar y adquirir equipos de protección personal.",breadcrumb:[{name:"Nosotros"}]})}
    <section class="section"><div class="container split-layout"><div class="image-frame"><img src="/assets/about-team.webp" width="1800" height="1200" fetchpriority="high" alt="Equipo de Maxguantes revisando especificaciones de protección personal"></div><div class="split-copy">${eyebrow("Desde 2015")}<h2 class="section-title">Nuestra historia.</h2><p>Maxguantes nació en Ciudad de Panamá con una idea concreta: responder con rapidez sin sacrificar la calidad de la información técnica. Con el tiempo ampliamos nuestra oferta desde protección de manos hacia ropa ignífuga, arco eléctrico, calzado, respiración, altura y dotaciones integrales.</p><p>Atendemos empresas, contratistas y proyectos que necesitan referencias identificables, documentación del fabricante y una comunicación clara durante su proceso de compra.</p></div></div></section>
    <section class="values section"><div class="container"><div class="section-head"><div>${eyebrow("Cómo trabajamos")}<h2 class="section-title">Principios que se ven<br>en cada cotización.</h2></div></div><div class="value-grid"><article><span>01</span><h3>Claridad técnica</h3><p>Identificamos producto, norma, variante y documentación para reducir ambigüedades.</p></article><article><span>02</span><h3>Respuesta responsable</h3><p>Confirmamos precios, disponibilidad y plazos antes de asumir compromisos.</p></article><article><span>03</span><h3>Atención directa</h3><p>Mantenemos comunicación con compras, operaciones y seguridad durante el proceso.</p></article><article><span>04</span><h3>Catálogo abierto</h3><p>Localizamos alternativas y productos especiales fuera de las referencias publicadas.</p></article></div></div></section>
    <section class="section"><div class="container"><div class="metric-banner"><div><strong>2015</strong><span>Fundación en Panamá</span></div><div><strong>Empresas</strong><span>Enfoque comercial B2B</span></div><div><strong>EPP</strong><span>Especialización industrial</span></div><div><strong>Exportación</strong><span>Atención internacional</span></div></div></div></section>`;
  return layout({title:"Acerca de Maxguantes | Proveedor de EPP en Panamá",description:"Conozca la historia de Maxguantes, empresa panameña fundada en 2015 y especializada en equipos de protección personal para industrias y proyectos.",path:"/nosotros/",active:"about",content,schemas:[breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Nosotros",path:"/nosotros/"}])]});
}

export function renderSolutions() {
  const risks = [
    ["riesgo-1","Arco eléctrico","Ropa, guantes y accesorios cuya selección debe alinearse con el estudio de energía incidente y las normas aplicables.","IEC 61482 · ASTM F1506 · NFPA 70E"],
    ["riesgo-2","Fuego y calor","Prendas y equipos para exposición a llama, calor convectivo, radiante o de contacto según la tarea.","EN ISO 11612 · EN ISO 14116"],
    ["riesgo-3","Corte y abrasión","Guantes seleccionados por nivel de corte, abrasión, destreza, agarre y condiciones de uso.","ANSI/ISEA 105 · EN 388"],
    ["riesgo-4","Riesgo químico","Protección de manos, cuerpo, rostro y respiración compatible con la sustancia, concentración y tiempo de exposición.","EN ISO 374 · información del químico"],
    ["riesgo-5","Caídas de altura","Arneses, conectores, eslingas y líneas de vida que deben integrarse al sistema y plan de rescate.","ANSI Z359 · EN 361 · EN 355"],
    ["riesgo-6","Gases y partículas","Selección de respiradores y filtros basada en contaminante, concentración, ajuste y programa respiratorio.","NIOSH 42 CFR 84 · EN 143 · EN 14387"]
  ];
  const content = `${pageHero({eyebrowText:"Soluciones por riesgo",title:"La referencia correcta empieza por entender la exposición.",intro:"Organizamos el catálogo para que compras y seguridad puedan partir del riesgo, revisar criterios y solicitar una alternativa documentada.",breadcrumb:[{name:"Soluciones"}]})}<section class="section"><div class="container"><div class="solution-grid">${risks.map((r,i)=>`<article id="${r[0]}" class="solution-card"><span>0${i+1}</span><h2>${r[1]}</h2><p>${r[2]}</p><small>Criterios frecuentes: ${r[3]}</small><button class="text-link button-link" type="button" data-open-quote>Consultar solución</button></article>`).join("")}</div><div class="technical-note"><strong>Importante</strong><p>La información del sitio ayuda a identificar opciones, pero no sustituye la evaluación de riesgos, el programa de seguridad ni la aprobación del responsable competente de su empresa.</p></div></div></section>`;
  return layout({title:"Soluciones de EPP por riesgo industrial | Maxguantes",description:"Encuentre equipos de protección para arco eléctrico, calor, corte, químicos, alturas, gases y partículas con asesoría en Panamá.",path:"/soluciones/",active:"solutions",content,schemas:[breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Soluciones",path:"/soluciones/"}])],keywords:"EPP por riesgo, arco eléctrico, protección química, trabajo en altura"});
}

export function renderIndustries() {
  const content = `${pageHero({eyebrowText:"Industrias",title:"Protección adaptada al trabajo que realmente se ejecuta.",intro:"Cada sector combina riesgos, condiciones ambientales, normas internas y frecuencias de reposición diferentes. Partimos de esa realidad para preparar la propuesta.",breadcrumb:[{name:"Industrias"}]})}<section class="section"><div class="container"><div class="industry-grid">${industries.map((industry,i)=>`<article><span>0${i+1}</span><h2>${industry.name}</h2><p>${industry.description}</p><button class="text-link button-link" type="button" data-open-quote>Consultar dotación</button></article>`).join("")}</div></div></section><section class="section process"><div class="container split-text"><div>${eyebrow("Información útil")}<h2 class="section-title">Para cotizar mejor,<br>necesitamos contexto.</h2></div><div class="prose"><p>Una requisición completa reduce consultas y mejora la comparación entre ofertas. Incluya, cuando sea posible:</p><ul class="check-list"><li>Tarea y riesgo principal</li><li>Norma o especificación exigida</li><li>Marca y SKU si ya están definidos</li><li>Tallas, cantidades y frecuencia</li><li>Fecha y lugar de entrega</li><li>Ficha, fotografía o documento de referencia</li></ul></div></div></section>`;
  return layout({title:"EPP para industria, minería, energía y construcción | Maxguantes",description:"Equipos de protección personal para energía, minería, petróleo y gas, construcción, manufactura, sector marítimo y logística.",path:"/sectores/",active:"industries",content,schemas:[breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Industrias",path:"/sectores/"}])]});
}

export function renderServices() {
  const services = [
    ["Selección y cotización de EPP","Revisamos referencias, normas, alternativas, cantidades y condiciones comerciales para preparar una propuesta clara."],
    ["Dotaciones para empresas y proyectos","Organizamos múltiples categorías, tallas y entregas dentro de un mismo requerimiento."],
    ["Productos especiales bajo pedido","Localizamos referencias fuera del catálogo publicado y evaluamos alternativas documentadas."],
    ["Personalización de prendas","Coordinamos serigrafía y bordado, incluyendo opciones con hilo especializado cuando la prenda y aplicación lo exigen."],
    ["Documentación técnica","Recopilamos fichas, certificados y datos del fabricante disponibles para la referencia cotizada."],
    ["Ventas internacionales","Atendemos solicitudes de exportación y coordinamos condiciones logísticas según destino y alcance."]
  ];
  const content = `${pageHero({eyebrowText:"Servicios",title:"Abastecimiento de EPP con atención técnica y comercial.",intro:"Apoyamos desde la identificación de una referencia hasta la preparación de dotaciones, personalización y suministro para proyectos.",breadcrumb:[{name:"Servicios"}]})}<section class="section"><div class="container"><div class="service-grid">${services.map((s,i)=>`<article><span>${String(i+1).padStart(2,"0")}</span><h2>${s[0]}</h2><p>${s[1]}</p></article>`).join("")}</div></div></section><section class="risk-band"><div class="container split-text dark-split"><div>${eyebrow("Bordado ignífugo",true)}<h2 class="section-title">Personalizar sin ignorar el desempeño.</h2></div><div><p>En prendas de protección, el método, el hilo y la ubicación de la personalización importan. Revisamos el requerimiento antes de confirmar el servicio.</p><button class="btn btn-primary" type="button" data-open-quote>Consultar personalización</button></div></div></section>`;
  return layout({title:"Servicios de suministro y personalización de EPP | Maxguantes",description:"Cotización de EPP, dotaciones industriales, productos bajo pedido, documentación técnica, personalización y ventas internacionales.",path:"/servicios/",active:"solutions",content,schemas:[breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Servicios",path:"/servicios/"}])]});
}

export function renderExport() {
  const content = `${pageHero({eyebrowText:"Ventas internacionales",title:"Suministro de protección industrial para proyectos fuera de Panamá.",intro:"Atendemos requerimientos internacionales de EPP, fabricación y referencias especiales, coordinando la propuesta según destino, volumen y condiciones logísticas.",breadcrumb:[{name:"Exportación"}]})}<section class="section export-section"><div class="container split-layout"><div class="image-frame wide"><img src="/assets/international-logistics.webp" width="1920" height="1080" fetchpriority="high" alt="Equipos de protección personal preparados para envío internacional"></div><div class="split-copy">${eyebrow("Alcance internacional")}<h2 class="section-title">Una solicitud clara desde el origen.</h2><p>Evaluamos producto, certificación, cantidad, personalización, país de destino e Incoterm para estructurar cada oferta. Los plazos se confirman después de validar disponibilidad o fabricación.</p><ul class="check-list"><li>Equipos de marcas reconocidas</li><li>Referencias y fabricación especial</li><li>Personalización sujeta a validación</li><li>Documentación comercial y técnica</li><li>Coordinación logística según alcance</li></ul><button class="btn btn-primary" type="button" data-open-quote>Solicitar oferta internacional</button></div></div></section><section class="section process"><div class="container">${eyebrow("Proceso de exportación")}<div class="steps"><article class="step"><span>01</span><h3>Requerimiento</h3><p>Producto, norma, cantidades, destino y fecha requerida.</p></article><article class="step"><span>02</span><h3>Validación</h3><p>Disponibilidad, fabricación, documentación y alternativa logística.</p></article><article class="step"><span>03</span><h3>Oferta</h3><p>Condición comercial, Incoterm, plazo estimado y documentos incluidos.</p></article></div></div></section>`;
  return layout({title:"Exportación de equipos de protección personal | Maxguantes",description:"Ventas internacionales de EPP, ropa ignífuga, guantes y dotaciones industriales desde Panamá para proyectos en Latinoamérica.",path:"/exportacion/",active:"industries",content,schemas:[breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Exportación",path:"/exportacion/"}])],keywords:"exportación EPP, proveedor EPP Latinoamérica, ropa ignífuga exportación"});
}

export function renderResources() {
  const content = `${pageHero({eyebrowText:"Recursos técnicos",title:"Información práctica para compras, operaciones y seguridad.",intro:"Criterios para preparar requisiciones, comparar referencias y conversar con su proveedor de EPP con mayor precisión.",breadcrumb:[{name:"Recursos"}]})}<section class="section"><div class="container"><div class="resource-grid">${resources.map((r,i)=>`<article class="resource-card"><span class="resource-index">0${i+1}</span><small>${new Date(r.date).toLocaleDateString("es-PA",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"})} · ${r.readTime}</small><h2><a href="/recursos/${r.slug}/">${r.title}</a></h2><p>${r.excerpt}</p><a class="text-link" href="/recursos/${r.slug}/">Leer recurso</a></article>`).join("")}</div></div></section>`;
  return layout({title:"Recursos sobre EPP y seguridad industrial | Maxguantes",description:"Guías sobre selección de EPP, ropa ignífuga, guantes de seguridad, proveedores y gestión de dotaciones industriales.",path:"/recursos/",active:"resources",content,schemas:[breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Recursos",path:"/recursos/"}])]});
}

export function renderResource(resource) {
  const articleSchema = {"@context":"https://schema.org","@type":"Article",headline:resource.title,datePublished:resource.date,dateModified:resource.date,author:{"@id":`${site.domain}/#organization`},publisher:{"@id":`${site.domain}/#organization`},mainEntityOfPage:`${site.domain}/recursos/${resource.slug}/`,description:resource.excerpt,inLanguage:"es-PA"};
  const content = `<article class="article"><header class="article-header"><div class="container narrow"><nav class="breadcrumb dark" aria-label="Migas de pan"><a href="/">Inicio</a><span>/</span><a href="/recursos/">Recursos</a><span>/</span><span aria-current="page">Artículo</span></nav>${eyebrow("Guía técnica",true)}<h1>${resource.title}</h1><p>${resource.excerpt}</p><small>${new Date(resource.date).toLocaleDateString("es-PA",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"})} · Lectura de ${resource.readTime}</small></div></header><div class="container narrow article-body">${resource.body.map(([heading,text])=>`<section><h2>${heading}</h2><p>${text}</p></section>`).join("")}<aside class="article-callout"><h2>¿Necesita identificar una referencia?</h2><p>Comparta la tarea, la norma o la ficha que está evaluando. Le ayudamos a preparar la solicitud.</p><button class="btn btn-primary" type="button" data-open-quote>Consultar con Maxguantes</button></aside><p class="article-disclaimer">Contenido informativo. La selección final debe ser aprobada por el responsable de seguridad competente y conforme a la evaluación de riesgos de la organización.</p></div></article>`;
  return layout({title:`${resource.title} | Maxguantes`,description:resource.excerpt,path:`/recursos/${resource.slug}/`,active:"resources",content,schemas:[articleSchema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Recursos",path:"/recursos/"},{name:resource.title,path:`/recursos/${resource.slug}/`}])],bodyClass:"article-page"});
}

export function renderContact() {
  const contactSchema = {"@context":"https://schema.org","@type":"ContactPage",name:"Contacto Maxguantes",url:`${site.domain}/contacto/`,mainEntity:{"@id":`${site.domain}/#organization`}};
  const content = `${pageHero({eyebrowText:"Contacto",title:"Hable directamente con nuestro equipo.",intro:"Comparta su requisición, referencia o necesidad. Confirmaremos alcance, precio y disponibilidad antes de preparar la propuesta.",breadcrumb:[{name:"Contacto"}]})}<section class="section"><div class="container contact-layout"><div class="contact-details"><div class="contact-block"><span>Ventas y cotizaciones</span><a href="mailto:${site.email}">${site.email}</a><a href="tel:${site.phone}">${site.phoneDisplay}</a><a href="${whatsappUrl()}" target="_blank" rel="noopener">WhatsApp ${site.whatsappDisplay}</a></div><div class="contact-block"><span>Oficina</span><p>${site.address}</p><p>${site.hours}</p><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}" target="_blank" rel="noopener">Abrir en Google Maps</a></div><div class="contact-promise"><strong>¿Qué ocurre después?</strong><ol><li>Revisamos el mensaje y referencias.</li><li>Confirmamos cualquier dato faltante.</li><li>Preparamos la respuesta comercial.</li></ol></div></div><form class="contact-form" name="contacto" method="POST" action="/gracias/" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="contacto"><p class="hidden-field"><label>No complete este campo: <input name="bot-field"></label></p>${eyebrow("Formulario de contacto")}<h2>Cuéntenos qué necesita.</h2><div class="field-grid"><label>Nombre *<input name="nombre" autocomplete="name" required></label><label>Empresa *<input name="empresa" autocomplete="organization" required></label></div><div class="field-grid"><label>Correo *<input type="email" name="email" autocomplete="email" required></label><label>Teléfono / WhatsApp *<input type="tel" name="telefono" autocomplete="tel" required></label></div><label>Asunto *<select name="asunto" required><option value="">Seleccione</option><option>Cotización de productos</option><option>Asesoría de selección</option><option>Pedido especial</option><option>Venta internacional</option><option>Personalización</option><option>Otro</option></select></label><label>Mensaje *<textarea name="mensaje" rows="6" required placeholder="Incluya SKU, marca, norma, cantidad, tallas y fecha requerida cuando sea posible"></textarea></label><label class="check-field"><input type="checkbox" name="privacidad" required><span>Acepto el tratamiento de mis datos para atender esta solicitud.</span></label><button class="btn btn-primary" type="submit">Enviar mensaje</button><p class="form-disclaimer">También puede enviar documentos directamente por correo o WhatsApp.</p></form></div></section>`;
  return layout({title:"Contacto y cotización de EPP | Maxguantes Panamá",description:"Contacte a Maxguantes para cotizar equipos de protección personal, ropa ignífuga, guantes y dotaciones industriales en Panamá.",path:"/contacto/",active:"contact",content,schemas:[contactSchema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Contacto",path:"/contacto/"}])]});
}

export function renderPrivacy() {
  const content = `${pageHero({eyebrowText:"Información legal",title:"Política de privacidad.",intro:"Información sobre los datos enviados voluntariamente a través de este sitio.",breadcrumb:[{name:"Privacidad"}]})}<section class="section"><div class="container narrow prose legal"><h2>Datos que recopilamos</h2><p>Cuando completa un formulario podemos recibir su nombre, empresa, correo, teléfono y la información incluida en su mensaje o solicitud de cotización.</p><h2>Finalidad</h2><p>Utilizamos estos datos para responder consultas, preparar cotizaciones, mantener comunicación comercial solicitada y documentar la relación con clientes y prospectos.</p><h2>Conservación y acceso</h2><p>El acceso se limita al personal y proveedores tecnológicos necesarios para operar los canales de contacto. Conservamos la información durante el tiempo razonablemente necesario para atender la relación comercial y obligaciones aplicables.</p><h2>Sus derechos</h2><p>Puede solicitar acceso, corrección o eliminación de sus datos escribiendo a <a href="mailto:${site.email}">${site.email}</a>. Algunas obligaciones comerciales o legales pueden requerir conservar determinados registros.</p><h2>Servicios externos</h2><p>El sitio puede utilizar servicios de alojamiento, formularios, analítica y mensajería. Los enlaces hacia WhatsApp, correo o mapas se rigen también por las políticas de esos servicios.</p><h2>Actualizaciones</h2><p>Esta versión fue preparada para el rediseño 2026. Antes de la publicación definitiva debe ser validada contra las políticas internas y requisitos legales de la empresa.</p></div></section>`;
  return layout({title:"Política de privacidad | Maxguantes",description:"Política de privacidad y tratamiento de datos enviados mediante los formularios y canales de contacto de Maxguantes.",path:"/privacidad/",content,schemas:[breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Privacidad",path:"/privacidad/"}])],bodyClass:"legal-page"});
}

export function renderThanks() {
  const content = `<section class="status-page"><div class="container narrow"><span class="status-mark">✓</span>${eyebrow("Mensaje recibido")}<h1>Gracias por contactar a Maxguantes.</h1><p>Revisaremos la información y responderemos por los datos indicados. Si necesita añadir una ficha o documento, puede enviarlo por WhatsApp o correo.</p><div class="button-row"><a class="btn btn-primary" href="${whatsappUrl("Hola Maxguantes, acabo de enviar una solicitud desde la web y deseo adjuntar información adicional.")}" target="_blank" rel="noopener">Continuar por WhatsApp</a><a class="btn btn-light-outline" href="/productos/">Volver al catálogo</a></div></div></section>`;
  return layout({title:"Solicitud recibida | Maxguantes",description:"Confirmamos la recepción de su mensaje o solicitud de cotización de equipos de protección personal para su empresa.",path:"/gracias/",content,bodyClass:"status-body",robots:"noindex,nofollow"});
}

export function render404() {
  const content = `<section class="status-page"><div class="container narrow"><span class="status-code">404</span>${eyebrow("Página no encontrada")}<h1>La dirección cambió o ya no existe.</h1><p>Puede explorar el catálogo, buscar una referencia o contactarnos para localizar el producto que necesita.</p><div class="button-row"><a class="btn btn-primary" href="/productos/">Ir al catálogo</a><a class="btn btn-light-outline" href="/contacto/">Contactar</a></div></div></section>`;
  return layout({title:"Página no encontrada | Maxguantes",description:"La página solicitada no está disponible. Explore el catálogo de EPP o contacte a Maxguantes para localizar una referencia.",path:"/404.html",content,bodyClass:"status-body",robots:"noindex,nofollow"});
}

export { site, categories, resources, whatsappUrl };
