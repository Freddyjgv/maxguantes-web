import { site, categories, brands, resources } from "./config.mjs";

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const absoluteUrl = (value = "") => /^https?:\/\//i.test(value) ? value : `${site.domain}${value}`;

const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

const anchorId = (value = "") => String(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const navItems = [
  ["/", "Inicio", "home"],
  ["/productos/", "Productos", "products"],
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
      <div class="quote-summary" data-quote-summary></div>
      <div class="quote-drawer-actions"><a class="btn btn-primary btn-block" href="/solicitud/">Revisar y enviar solicitud</a><button class="text-link button-link" type="button" data-close-quote>Continuar viendo productos</button></div>
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
  <link rel="icon" href="/assets/favicon-192x192.png?v=20260909-2" type="image/png" sizes="192x192">
  <link rel="shortcut icon" href="/assets/favicon-192x192.png?v=20260909-2" type="image/png">
  <link rel="apple-touch-icon" href="/assets/favicon-192x192.png?v=20260909-2" sizes="192x192">
  <link rel="preload" href="/assets/hero-industrial.webp" as="image" type="image/webp" fetchpriority="high">
  <link rel="preload" href="/assets/styles.css?v=20260910-1" as="style">
  <link rel="stylesheet" href="/assets/styles.css?v=20260910-1">
  <script defer src="/assets/site.js?v=20260910-1"></script>
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
  return `<div class="home-category-list">${categories.map((c, index) => `<a class="home-category-item" href="/categorias/${c.slug}/"><span class="home-category-index">${String(index + 1).padStart(2,"0")}</span><span class="home-category-image"><img src="${c.image}" width="72" height="72" loading="lazy" alt=""></span><h3>${c.name}</h3><span class="home-category-arrow" aria-hidden="true">→</span></a>`).join("")}</div>`;
}

function partnerBand() {
  return `<div class="partner-band" aria-label="Marcas con las que trabajamos"><div class="container partner-inner"><p>Solo trabajamos con las mejores marcas.</p><div class="partner-logos">${brands.map(b=>`<img src="${b.image}" width="140" height="140" loading="lazy" alt="${esc(b.name)}">`).join("")}</div></div></div>`;
}

function electricalProtectionSection() {
  const solutions = [
    { number: "01", title: "Ropa FR, AR y antiestática", text: "Overoles, camisas, pantalones y capas de protección.", href: "/categorias/ropa-ignifuga/", image: "/assets/products/fr50-card.webp", alt: "Overol de protección ignífuga y antiestática", kind: "product" },
    { number: "02", title: "Guantes para riesgo eléctrico", text: "Opciones dieléctricas y contra arco según la aplicación.", href: "/categorias/proteccion-de-manos/", image: "/assets/products/a780-card.webp", alt: "Guante técnico con protección frente a arco eléctrico", kind: "product" },
    { number: "03", title: "Protección facial", text: "Pantallas y visores para rostro, cuello y cabeza.", href: "/categorias/proteccion-cabeza-visual-facial/", image: "/assets/products/fr18-card.webp", alt: "Balaclava FR18 de Portwest", kind: "product" },
    { number: "04", title: "Cascos dieléctricos", text: "Protección de cabeza según clase y norma requerida.", href: "/categorias/proteccion-cabeza-visual-facial/", image: "/assets/products/gh327-card.webp", alt: "Casco dieléctrico GH327 de General Electric", kind: "product" },
    { number: "05", title: "Arneses para riesgo eléctrico", text: "Opciones dieléctricas o sin componentes conductivos.", href: "/categorias/trabajo-en-altura/", image: "/assets/products/maxipro-card.webp", alt: "Arnés dieléctrico Maxipro de Climax", kind: "product" }
  ];

  return `<aside class="portwest-authorized" aria-label="Maxguantes, distribuidor autorizado Portwest">
      <div class="portwest-authorized-media" aria-hidden="true">
        <img src="/assets/portwest-fr-campaign.webp" width="800" height="538" loading="lazy" alt="">
      </div>
      <div class="container portwest-authorized-inner">
        <div class="portwest-authorized-copy">
          <img class="portwest-authorized-logo" src="/assets/brands/portwest-reverse.svg" width="429" height="107" loading="lazy" alt="Portwest">
          <span>Distribuidor autorizado.</span>
          <h2>Protección ignífuga certificada</h2>
          <p>Desde 1904, Portwest desarrolla ropa de trabajo y EPP para operaciones exigentes, con especialización en prendas resistentes a la llama y presencia en más de 130 países. Maxguantes acerca su catálogo, documentación técnica y atención comercial a empresas y proyectos.</p>
          <a class="btn portwest-authorized-cta" href="/productos/?marca=portwest#catalogo">Ver productos Portwest <b aria-hidden="true">→</b></a>
        </div>
      </div>
      <div class="container portwest-authorized-standards" aria-label="Normas técnicas de referencia">
        <p>Normas según referencia</p>
        <div class="portwest-standard-list">
          <span title="ASTM F1506 — materiales textiles para exposición a arco eléctrico">ASTM F1506</span>
          <span title="NFPA 2112 — prendas resistentes a la llama para riesgos térmicos industriales">NFPA 2112</span>
          <span title="NFPA 70E — seguridad eléctrica en lugares de trabajo">NFPA 70E</span>
          <span title="ANSI/ISEA Z89.1 — protección industrial de cabeza">ANSI Z89.1</span>
          <span title="IEC 61482 — ropa contra los peligros térmicos de un arco eléctrico">IEC 61482</span>
        </div>
        <small>La conformidad se valida en la ficha vigente de cada producto.</small>
      </div>
    </aside>
    <section class="electrical-protection" aria-labelledby="electrical-protection-title">
      <div class="container">
        <div class="electrical-grid">
          <div class="electrical-intro">
            ${eyebrow("Protección eléctrica especializada")}
            <h2 class="section-title" id="electrical-protection-title">Dotación integral para<br>trabajos con riesgo eléctrico.</h2>
            <p>Protección corporal y EPP complementario seleccionados según el riesgo, la energía incidente y la norma aplicable.</p>
            <a class="btn btn-primary" href="/categorias/ropa-ignifuga/">Ver protección especializada →</a>
          </div>
          <figure class="electrical-worker-panel">
            <span>Protección integral</span>
            <picture><source media="(max-width: 640px)" srcset="/assets/electrical-worker-mobile.webp" width="420" height="910"><img src="/assets/electrical-worker-white-v2.webp" width="700" height="1518" loading="lazy" alt="Trabajador equipado con ropa de protección ignífuga, casco y guantes"></picture>
            <figcaption>FR / AR / ESD</figcaption>
          </figure>
          ${solutions.map((item, index) => `<a class="electrical-tile electrical-tile-${index + 1}" href="${item.href}"><div class="electrical-tile-copy"><span>${item.number}</span><h3>${item.title}</h3><p>${item.text}</p><b aria-hidden="true">→</b></div><div class="electrical-tile-image electrical-tile-image-${item.kind.replace(" ", " electrical-tile-image-")}"><img src="${item.image}" width="520" height="520" loading="lazy" alt="${item.alt}"></div></a>`).join("")}
        </div>
      </div>
  </section>`;
}

function productCard(product) {
  const standards = Array.isArray(product.standards) ? product.standards.filter(Boolean) : [];
  const certifications = standards.length ? `<div class="cert-tooltip"><button class="cert-pill" type="button" aria-expanded="false"><span aria-hidden="true">✓</span> Certificaciones <b>${standards.length}</b></button><div class="cert-popover" role="tooltip"><strong>Normas y certificaciones</strong><ul>${standards.map(standard => `<li>${esc(standard)}</li>`).join("")}</ul></div></div>` : "";
  const variantPicker = product.structuredVariants?.length ? `<label class="card-variant-picker"><span>Presentación</span><select data-product-variant aria-label="Seleccione presentación de ${esc(product.name)}">${variantOptions(product)}</select></label>` : "";
  return `<article class="product-card" data-product-card data-name="${esc(product.name.toLowerCase())}" data-sku="${esc(product.sku.toLowerCase())}" data-categories="${esc((product.categories || [product.category]).join(" "))}" data-brand="${esc((product.brand || "").toLowerCase())}" data-brand-slug="${anchorId(product.brand || "maxguantes")}" data-certifications="${esc(standards.join(" ").toLowerCase())}">
    <a class="product-visual" href="/productos/${product.slug}/">${product.specialOrder ? '<span class="product-status">Pedido especial</span>' : ""}<img src="${esc(product.image)}" width="700" height="700" loading="lazy" alt="${esc(product.name)}"></a>
    <div class="product-body"><span class="product-code">${esc(product.sku)} · ${esc(product.brand || "Maxguantes")}</span><h3><a href="/productos/${product.slug}/">${esc(product.name)}</a></h3><p>${esc(product.summary)}</p>${certifications}${variantPicker}<div class="product-purchase"><label class="quantity-picker"><span class="sr-only">Cantidad de ${esc(product.name)}</span><button type="button" data-quantity-minus aria-label="Reducir cantidad">−</button><input type="number" min="1" max="9999" value="1" inputmode="numeric" data-product-quantity aria-label="Cantidad de ${esc(product.name)}"><button type="button" data-quantity-plus aria-label="Aumentar cantidad">+</button></label><button class="btn btn-dark add-quote" type="button" data-code="${esc(product.sku)}" data-name="${esc(product.shortName || product.name)}" data-image="${esc(product.image)}" data-dolibarr-product-id="${esc(product.dolibarrProductId ?? "")}" data-dolibarr-ref="${esc(product.dolibarrRef || "")}">Agregar</button><a class="icon-button" href="/productos/${product.slug}/" aria-label="Ver ${esc(product.name)}">→</a></div></div>
  </article>`;
}

function variantOptions(product) {
  return product.structuredVariants.map(variant => {
    const details = variant.label || [variant.attributes?.talla, variant.attributes?.color].filter(Boolean).join(" · ") || variant.public_code;
    return `<option value="${esc(variant.public_code)}" data-variant-id="${esc(variant.id ?? "")}" data-variant-label="${esc(details)}" data-variant-attributes="${esc(JSON.stringify(variant.attributes || {}))}" data-dolibarr-product-id="${esc(variant.dolibarr_product_id ?? product.dolibarrProductId ?? "")}" data-dolibarr-ref="${esc(variant.dolibarr_ref || product.dolibarrRef || "")}">${esc(details)}</option>`;
  }).join("");
}

function emptyCatalog() {
  return `<div class="catalog-empty"><span class="category-symbol">+</span><h3>Catálogo en preparación</h3><p>Podemos localizar o cotizar referencias que todavía no aparecen publicadas. Envíenos el SKU, la marca, la norma o su requisición.</p><button class="btn btn-primary" type="button" data-open-quote>Solicitar producto</button></div>`;
}

export function renderHome(products) {
  const featured = products
    .filter(product => product.featured)
    .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) || a.name.localeCompare(b.name, "es"))
    .slice(0,3);
  const schema = {"@context":"https://schema.org","@type":"WebSite","@id":`${site.domain}/#website`,url:site.domain,name:site.name,description:site.description,inLanguage:"es-PA",publisher:{"@id":`${site.domain}/#organization`}};
  const content = `
    <section class="hero">
      <img class="hero-bg" src="/assets/hero-industrial.webp" width="1800" height="1200" fetchpriority="high" alt="Profesional industrial con equipo de protección personal">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="container hero-content"><div class="hero-copy">${eyebrow("Seguridad industrial B2B · Panamá", true)}<h1 class="display">Protección certificada.<br><span>Respuesta inmediata.</span></h1><p class="hero-lead">Equipos de protección personal para operaciones exigentes. Especialistas en ropa ignífuga, arco eléctrico, guantes técnicos y dotaciones industriales.</p><div class="button-row"><a class="btn btn-primary" href="/productos/">Explorar productos →</a><button class="btn btn-outline" type="button" data-open-quote>Solicitar cotización</button></div></div></div>
      <aside class="hero-shipping" aria-label="Envío gratis en Ciudad de Panamá para compras superiores a ciento cincuenta dólares"><span class="hero-shipping-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M3 5h11v10H3V5Zm11 4h3l4 4v2h-7V9ZM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg></span><span class="hero-shipping-copy"><b>Envío gratis</b><small>En Ciudad de Panamá para compras superiores a US$150. Condiciones aplican.</small></span></aside>
      ${partnerBand()}
    </section>
    ${electricalProtectionSection()}
    <section class="home-categories" aria-labelledby="home-categories-title"><div class="container"><header class="home-categories-head"><div>${eyebrow("Equipos de protección personal")}<h2 class="section-title" id="home-categories-title">Protección organizada por necesidad.</h2></div><p>Encuentre rápidamente guantes, cascos, lentes, respiración, protección auditiva, calzado, equipos para altura y dotaciones para riesgos especiales.</p></header>${categoryCards()}<div class="home-categories-action"><a class="btn btn-primary" href="/productos/">Explorar catálogo completo →</a></div></div></section>
    <section class="section"><div class="container"><div class="section-head"><div>${eyebrow("Selección técnica")}<h2 class="section-title">Productos destacados.</h2><p class="section-intro">Referencias de muestra mientras incorporamos el catálogo completo desde Supabase.</p></div><a class="text-link" href="/productos/">Ver productos</a></div>${featured.length ? `<div class="product-grid">${featured.map(productCard).join("")}</div>` : emptyCatalog()}</div></section>
    `;
  return layout({title:"Maxguantes | Equipos de protección personal en Panamá",description:"EPP certificado para empresas: ropa ignífuga, arco eléctrico, guantes, respiración, altura y dotaciones industriales en Panamá.",path:"/",active:"home",content,schemas:[schema],keywords:"equipos de protección personal Panamá, EPP Panamá, seguridad industrial"});
}

export function renderProducts(products) {
  const catalogBrands = [...new Set(products.map(product => product.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
  const content = `${pageHero({eyebrowText:"Catálogo técnico",title:"Equipos de protección personal para cada riesgo.",intro:"Explore las referencias publicadas o envíenos el SKU, la marca, la norma o su requisición. Precio y disponibilidad se confirman para cada cliente.",breadcrumb:[{name:"Productos"}]})}
    <section class="catalog-tools"><div class="container tools-inner"><label class="search-box"><span class="sr-only">Buscar productos</span><input type="search" placeholder="Buscar por producto, SKU, marca o aplicación" data-product-search></label><span class="tool-status" data-result-count>${products.length} productos publicados</span></div></section>
    <section class="section catalog-section" id="catalogo"><div class="container catalog-layout"><aside class="filter-panel" aria-label="Filtrar catálogo"><div class="filter-group"><h2>Por categoría</h2><button class="filter-chip active" type="button" data-filter-category="all" aria-pressed="true">Todas <span>${products.length}</span></button>${categories.map(category=>`<button class="filter-chip" type="button" data-filter-category="${category.slug}" aria-pressed="false">${category.shortName}<span>${products.filter(product=>(product.categories || [product.category]).includes(category.slug)).length}</span></button>`).join("")}</div><div class="filter-group"><h2>Por marca</h2><button class="filter-chip active" type="button" data-filter-brand="all" aria-pressed="true">Todas las marcas <span>${products.length}</span></button>${catalogBrands.map(brand=>`<button class="filter-chip" type="button" data-filter-brand="${anchorId(brand)}" aria-pressed="false">${esc(brand)}<span>${products.filter(product=>anchorId(product.brand)===anchorId(brand)).length}</span></button>`).join("")}</div><button class="clear-catalog-filters" type="button" data-clear-catalog>Limpiar filtros</button><div class="catalog-help"><strong>¿No aparece?</strong><p>Trabajamos con catálogos especiales y referencias bajo pedido.</p><button class="text-link button-link" type="button" data-open-quote>Enviar requisición</button></div></aside><div class="catalog-results"><div class="catalog-topline"><div><p>Contenido técnico preparado para cotización B2B.</p><div class="active-filters" data-active-filters aria-live="polite"></div></div><a href="/contacto/" class="text-link">Solicitar asesoría</a></div><div class="product-grid catalog-grid" data-product-grid>${products.map(productCard).join("")}</div><div class="no-results" hidden data-no-results><h2>No encontramos coincidencias.</h2><p>Modifique la búsqueda o elimine los filtros para volver a ver el catálogo.</p><button class="btn btn-primary" type="button" data-clear-catalog>Limpiar filtros</button></div><nav class="catalog-pagination" aria-label="Páginas del catálogo" data-pagination hidden><button type="button" data-page-prev aria-label="Página anterior">← Anterior</button><div data-page-numbers></div><button type="button" data-page-next aria-label="Página siguiente">Siguiente →</button></nav></div></div></section>`;
  const schema = {"@context":"https://schema.org","@type":"CollectionPage",name:"Catálogo de equipos de protección personal",url:`${site.domain}/productos/`,description:"Catálogo técnico de EPP de Maxguantes"};
  return layout({title:"Catálogo de EPP certificado | Maxguantes Panamá",description:"Catálogo de equipos de protección personal para empresas: ropa ignífuga, guantes, respiradores, protección visual, altura y calzado.",path:"/productos/",active:"products",content,schemas:[schema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Productos",path:"/productos/"}])],keywords:"catálogo EPP Panamá, equipos de seguridad industrial, cotizar EPP"});
}

export function renderProduct(product, products) {
  const related = products.filter(p => p.slug !== product.slug && (p.categories || [p.category]).some(category => (product.categories || [product.category]).includes(category))).slice(0,3);
  const variantSelector = product.structuredVariants?.length
    ? `<label class="product-variant-picker"><span>Seleccione talla, color o presentación</span><select data-product-variant>${variantOptions(product)}</select><small>Agregue cada talla o presentación como una línea independiente.</small></label>`
    : "";
  const productSchema = {"@context":"https://schema.org","@type":"Product",name:product.name,sku:product.sku,brand:{"@type":"Brand",name:product.brand},category:product.categoryName,description:product.summary,image:absoluteUrl(product.image),url:`${site.domain}/productos/${product.slug}/`};
  const content = `<section class="product-detail"><div class="container"><nav class="breadcrumb dark" aria-label="Migas de pan"><a href="/">Inicio</a><span>/</span><a href="/productos/">Productos</a><span>/</span><a href="/categorias/${product.category}/">${esc(product.categoryName)}</a><span>/</span><span aria-current="page">${esc(product.sku)}</span></nav><div class="product-detail-grid"><div class="product-gallery">${product.specialOrder ? '<span class="product-status">Pedido especial</span>' : ""}<img src="${esc(product.image)}" width="900" height="900" fetchpriority="high" alt="${esc(product.name)}"></div><div class="product-summary">${eyebrow(`${esc(product.brand)} · ${esc(product.sku)}`, true)}<h1>${esc(product.name)}</h1><p class="product-lead">${esc(product.summary)}</p><div class="notice"><strong>Cotización personalizada</strong><span>No mostramos precio ni inventario. Confirmamos ambos según el cliente, cantidad y fecha requerida.</span></div>${variantSelector}<div class="detail-add-row"><label class="quantity-picker quantity-picker-large"><span class="sr-only">Cantidad de ${esc(product.name)}</span><button type="button" data-quantity-minus aria-label="Reducir cantidad">−</button><input type="number" min="1" max="9999" value="1" inputmode="numeric" data-product-quantity aria-label="Cantidad de ${esc(product.name)}"><button type="button" data-quantity-plus aria-label="Aumentar cantidad">+</button></label><button class="btn btn-primary btn-large add-quote" type="button" data-code="${esc(product.sku)}" data-name="${esc(product.shortName || product.name)}" data-image="${esc(product.image)}" data-dolibarr-product-id="${esc(product.dolibarrProductId ?? "")}" data-dolibarr-ref="${esc(product.dolibarrRef || "")}">Agregar a solicitud</button></div><a class="btn btn-outline" href="${whatsappUrl(`Hola Maxguantes, deseo cotizar el producto ${product.sku} - ${product.name}.`)}" target="_blank" rel="noopener">Consultar por WhatsApp</a></div></div></div></section>
    <section class="section"><div class="container detail-columns"><div class="prose"><h2>Descripción</h2><p>${esc(product.description)}</p><h2>Características</h2><ul class="check-list">${product.features.map(f=>`<li>${esc(f)}</li>`).join("")}</ul><h2>Materiales y variantes</h2><p>${esc(product.materials.join(", "))}.</p><ul>${product.variants.map(v=>`<li>${esc(v)}</li>`).join("")}</ul></div><aside class="spec-card"><span class="eyebrow">Documentación técnica</span><h2>Normas y referencias</h2><ul>${product.standards.map(s=>`<li>${esc(s)}</li>`).join("")}</ul><p>Las normas y el desempeño deben verificarse contra la ficha vigente del fabricante antes de aprobar una aplicación.</p>${product.technicalSheet ? `<a class="btn btn-outline" href="${esc(product.technicalSheet)}" target="_blank" rel="noopener">Abrir ficha técnica</a>` : `<button class="text-link button-link" type="button" data-open-quote>Solicitar ficha técnica</button>`}</aside></div></section>
    ${related.length ? `<section class="section related"><div class="container"><div class="section-head"><div>${eyebrow("Misma categoría")}<h2 class="section-title">Productos relacionados.</h2></div><a class="text-link" href="/categorias/${product.category}/">Ver categoría</a></div><div class="product-grid">${related.map(productCard).join("")}</div></div></section>` : ""}`;
  return layout({title:product.seoTitle || `${product.name} | Maxguantes`,description:product.seoDescription || product.summary,path:`/productos/${product.slug}/`,active:"products",content,schemas:[productSchema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Productos",path:"/productos/"},{name:product.categoryName,path:`/categorias/${product.category}/`},{name:product.sku,path:`/productos/${product.slug}/`}])],bodyClass:"product-page"});
}

export function renderRequest() {
  const content = `${pageHero({eyebrowText:"Solicitud de cotización",title:"Revise su solicitud antes de enviarla.",intro:"Ajuste cantidades, indique tallas u observaciones por referencia y comparta los datos de su empresa. Nuestro equipo confirmará precio, plazo y disponibilidad.",breadcrumb:[{name:"Solicitud"}]})}
    <section class="section request-section"><div class="container request-layout"><div><div class="request-heading"><div><span class="eyebrow">Referencias seleccionadas</span><h2>Productos a cotizar</h2></div><a class="text-link" href="/productos/">+ Agregar más productos</a></div><div class="request-items" data-request-items aria-live="polite"></div></div><aside class="request-form-card"><span class="eyebrow">Datos de contacto</span><h2>Enviar solicitud</h2><form class="quote-form" name="solicitud-cotizacion" method="POST" action="/gracias/" data-netlify="true" netlify-honeypot="bot-field" data-quote-form><input type="hidden" name="form-name" value="solicitud-cotizacion"><input type="hidden" name="productos" value="" data-quote-products><p class="hidden-field"><label>No complete este campo: <input name="bot-field"></label></p><label>Empresa *<input name="empresa" autocomplete="organization" required></label><div class="field-grid"><label>Nombre *<input name="nombre" autocomplete="name" required></label><label>Teléfono / WhatsApp *<input type="tel" name="telefono" autocomplete="tel" required></label></div><label>Correo *<input type="email" name="email" autocomplete="email" required></label><label>Fecha requerida<input type="date" name="fecha_requerida"></label><label>Información general<textarea name="mensaje" rows="3" placeholder="Lugar de entrega, riesgo u otra condición"></textarea></label><label class="check-field"><input type="checkbox" name="privacidad" required><span>Acepto el tratamiento de mis datos para atender esta solicitud.</span></label><button class="btn btn-whatsapp btn-block" type="button" data-quote-whatsapp>Enviar por WhatsApp</button><button class="btn btn-primary btn-block" type="submit">Enviar por formulario</button><p class="form-disclaimer">Esta solicitud no constituye una orden. Precio, plazo y disponibilidad serán confirmados por Maxguantes.</p></form></aside></div></section>`;
  return layout({title:"Solicitud de cotización de EPP | Maxguantes",description:"Revise y envíe su solicitud de cotización de equipos de protección personal a Maxguantes.",path:"/solicitud/",active:"products",content,bodyClass:"request-page",robots:"noindex,follow"});
}

export function renderCategory(category, products) {
  const filtered = products.filter(p => (p.categories || [p.category]).includes(category.slug));
  const content = `${pageHero({eyebrowText:`Categoría · ${category.code}`,title:category.name,intro:category.description,breadcrumb:[{name:"Productos",path:"/productos/"},{name:category.shortName}]})}<section class="section"><div class="container"><div class="category-intro"><div><h2>Selección según su aplicación</h2><p>Indique tarea, riesgo, norma, cantidad, tallas y fecha requerida. Nuestro equipo confirmará alternativas, precio y disponibilidad.</p></div><ul>${category.risks.map(r=>`<li>${r}</li>`).join("")}</ul></div>${filtered.length ? `<div class="product-grid">${filtered.map(productCard).join("")}</div>` : emptyCatalog()}</div></section>`;
  const schema = {"@context":"https://schema.org","@type":"CollectionPage",name:category.name,description:category.description,url:`${site.domain}/categorias/${category.slug}/`,isPartOf:{"@id":`${site.domain}/#website`}};
  return layout({title:`${category.name} en Panamá | Maxguantes`,description:`${category.description} Solicite asesoría técnica y cotización para su empresa o proyecto.`,path:`/categorias/${category.slug}/`,active:"products",content,schemas:[schema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Productos",path:"/productos/"},{name:category.shortName,path:`/categorias/${category.slug}/`}])],keywords:category.keywords,robots:filtered.length ? undefined : "noindex,follow"});
}

export function renderAbout() {
  const sectors = [
    ["01", "Petroterminales", "EPP para almacenamiento, despacho, mantenimiento y operaciones con combustibles."],
    ["02", "Generación y distribución de energía", "Protección para tareas eléctricas, mantenimiento de redes, plantas y servicios técnicos."],
    ["03", "Transporte de combustible", "Dotaciones para conductores, operadores, patios, carga y descarga de productos."],
    ["04", "Navieras y operaciones marítimas", "Equipos para puertos, embarcaciones, terminales y actividades expuestas a intemperie."],
    ["05", "Construcción e infraestructura", "Protección para obra civil, montaje, soldadura, trabajo en altura y uso de herramientas."],
    ["06", "Contratistas industriales", "Suministro para cuadrillas de mantenimiento, proyectos, paradas de planta y servicios especializados."]
  ];
  const risks = [
    ["Arco eléctrico", "Energía incidente, contacto eléctrico y riesgos térmicos asociados.", "/categorias/ropa-ignifuga/"],
    ["Fuego y calor", "Llama, calor convectivo, radiante y de contacto.", "/categorias/ropa-ignifuga/"],
    ["Electricidad estática", "Prendas y dotaciones para operaciones que requieren control electrostático.", "/categorias/ropa-ignifuga/"],
    ["Corte, abrasión e impacto", "Protección de manos según tarea, agarre, destreza y nivel de exposición.", "/categorias/proteccion-de-manos/"],
    ["Sustancias químicas", "Compatibilidad de manos, cuerpo, rostro y respiración con el agente presente.", "/categorias/proteccion-corporal/"],
    ["Caídas de altura", "Arneses, eslingas, conectores y sistemas sujetos a validación técnica.", "/categorias/trabajo-en-altura/"],
    ["Gases, vapores y partículas", "Respiradores, filtros y cartuchos seleccionados para el contaminante.", "/categorias/proteccion-respiratoria/"],
    ["Cabeza, visión y audición", "Cascos, lentes, visores y protección auditiva para la exposición ocupacional.", "/categorias/proteccion-cabeza-visual-facial/"]
  ];
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${site.domain}/nosotros/#aboutpage`,
    url: `${site.domain}/nosotros/`,
    name: "Maxguantes: proveedor de equipos de protección personal en Panamá",
    description: "Empresa panameña de suministro y asesoría de EPP para petroterminales, energía, transporte de combustible, navieras, construcción y contratistas.",
    inLanguage: "es-PA",
    mainEntity: {
      "@id": `${site.domain}/#organization`,
      "@type": ["Organization", "LocalBusiness"],
      name: site.name,
      foundingDate: site.founded,
      areaServed: ["Panamá", "Latinoamérica"],
      knowsAbout: ["Equipos de protección personal", "Ropa ignífuga", "Protección contra arco eléctrico", "Protección de manos", "Protección respiratoria", "Trabajo en altura", "Seguridad industrial"]
    }
  };
  const content = `${pageHero({eyebrowText:"Proveedor de EPP en Panamá",title:"Protección industrial para operaciones que no pueden detenerse.",intro:"Desde 2015 ayudamos a empresas, contratistas y proyectos a identificar, cotizar y adquirir equipos de protección personal con información clara, atención directa y respuesta comercial.",breadcrumb:[{name:"Nosotros"}]})}
    <section class="section about-intro"><div class="container split-layout"><div class="image-frame about-team-image"><img src="/assets/about-team.webp" width="1800" height="1200" fetchpriority="high" alt="Equipo técnico de Maxguantes revisando equipos de protección personal y especificaciones para un cliente industrial"></div><div class="split-copy">${eyebrow("Quiénes somos")}<h2 class="section-title">Criterio técnico.<br>Respuesta comercial.</h2><p>Maxguantes es una empresa panameña especializada en el suministro de equipos de protección personal para operaciones industriales. Nacimos para resolver una necesidad concreta: responder con rapidez sin sacrificar la identificación de la referencia, la norma, la documentación ni las condiciones reales de uso.</p><p>Trabajamos estrechamente con departamentos de compras, seguridad, operaciones y mantenimiento. Nuestro objetivo no es entregar una lista genérica, sino facilitar una selección trazable y una cotización alineada con el riesgo, la cantidad, la fecha requerida y las condiciones comerciales de cada empresa.</p><div class="about-trust-row"><div><strong>2015</strong><span>Fundación en Panamá</span></div><div><strong>B2B</strong><span>Atención especializada</span></div><div><strong>LATAM</strong><span>Alcance comercial</span></div></div></div></div></section>
    <section class="about-sectors" aria-labelledby="about-sectors-title"><img class="about-sectors-bg" src="/assets/about-industries.webp" width="1672" height="941" loading="lazy" alt="Equipo industrial inspeccionando una petroterminal con tanques, tuberías e infraestructura energética"><div class="about-sectors-shade"></div><div class="container about-sectors-content">${eyebrow("Industrias que atendemos",true)}<h2 class="section-title" id="about-sectors-title">Experiencia junto a<br>operaciones críticas.</h2><p class="about-sectors-lead">Nuestros clientes incluyen algunas de las principales petroterminales y empresas de generación y distribución de energía del país, además de sus contratistas, transportistas de combustible, navieras y constructoras.</p><div class="about-sector-grid">${sectors.map(item=>`<article><span>${item[0]}</span><h3>${item[1]}</h3><p>${item[2]}</p></article>`).join("")}</div><a class="btn btn-primary" href="/sectores/">Conocer las industrias que atendemos →</a></div></section>
    <section class="section about-risks" aria-labelledby="about-risks-title"><div class="container"><div class="section-head"><div>${eyebrow("Protección según la exposición")}<h2 class="section-title" id="about-risks-title">Riesgos diferentes requieren<br>respuestas diferentes.</h2><p class="section-intro">Organizamos nuestra oferta para que cada conversación comience por la tarea y el peligro, no únicamente por el nombre del producto.</p></div><a class="text-link" href="/productos/">Explorar productos por categoría</a></div><div class="about-risk-grid">${risks.map((item,index)=>`<a href="${item[2]}"><span>${String(index+1).padStart(2,"0")}</span><h3>${item[0]}</h3><p>${item[1]}</p><b aria-hidden="true">→</b></a>`).join("")}</div></div></section>
    <section class="about-purpose"><div class="container about-purpose-layout"><div class="about-purpose-copy">${eyebrow("Nuestros objetivos")}<h2 class="section-title">Servicio excepcional con responsabilidad.</h2><p>Queremos que cada cliente encuentre la solución adecuada para sus necesidades. Por eso mantenemos un equipo dispuesto a revisar referencias, riesgos, especificaciones y alternativas, acompañando la solicitud desde la consulta inicial hasta la entrega.</p><p>También asumimos el crecimiento con un criterio responsable y sostenible. Buscamos reducir impactos innecesarios en nuestra operación y priorizamos relaciones con fabricantes y proveedores que compartan principios éticos, sociales y de cumplimiento.</p><div class="button-row"><a class="btn btn-primary" href="/contacto/">Hablar con nuestro equipo →</a><a class="btn btn-light-outline" href="/productos/">Explorar productos</a></div></div><div class="about-principles"><article><span>01</span><h3>Claridad técnica</h3><p>Identificamos referencia, norma, variante y documentación para reducir ambigüedades.</p></article><article><span>02</span><h3>Respuesta responsable</h3><p>Confirmamos precios, disponibilidad y plazos antes de asumir compromisos.</p></article><article><span>03</span><h3>Atención directa</h3><p>Mantenemos comunicación con compras, operaciones y seguridad durante el proceso.</p></article><article><span>04</span><h3>Abastecimiento flexible</h3><p>Combinamos referencias publicadas, catálogos especiales y productos bajo pedido.</p></article></div></div></section>`;
  return layout({title:"Maxguantes | Proveedor de EPP y seguridad industrial en Panamá",description:"Proveedor panameño de EPP para petroterminales, energía, combustibles, navieras, construcción y contratistas. Asesoría y cotización B2B.",path:"/nosotros/",active:"about",content,schemas:[aboutSchema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Nosotros",path:"/nosotros/"}])],bodyClass:"about-page",keywords:"proveedor de EPP en Panamá, equipos de protección personal Panamá, seguridad industrial, ropa ignífuga, arco eléctrico, petroterminales"});
}

export function renderIndustries() {
  const sectors = [
    {number:"01",name:"Energía y utilities",copy:"Desde generación y subestaciones hasta cuadrillas de distribución, los trabajos eléctricos exigen compatibilidad entre la energía incidente, la tarea y la dotación. Apoyamos la selección de prendas FR/AR, protección de manos y equipos complementarios para mantenimiento, maniobras, inspecciones y atención de fallas.",risks:["Arco eléctrico","Electricidad estática","Trabajo en altura"],products:"Overoles y camisas FR/AR, guantes dieléctricos y contra arco eléctrico, cascos clase E, pantallas faciales y arneses dieléctricos."},
    {number:"02",name:"Petroterminales, petróleo y combustibles",copy:"Las operaciones de almacenamiento, transferencia, carga, descarga y mantenimiento combinan exposición a hidrocarburos, inflamabilidad, ambientes exteriores y tránsito operativo. Estructuramos dotaciones para personal de patio, operadores, mantenimiento y contratistas, incluyendo requerimientos de prendas ignífugas y control electrostático.",risks:["Llama y calor","Hidrocarburos","Atmósferas peligrosas"],products:"Ropa ignífuga y antiestática, guantes resistentes a químicos, lentes de seguridad, protección respiratoria y calzado de seguridad."},
    {number:"03",name:"Construcción e infraestructura",copy:"Obras civiles, montaje electromecánico, soldadura y actividades en altura demandan EPP práctico, durable y coherente con el frente de trabajo. Atendemos proyectos y contratistas que requieren consolidar tallas, categorías y documentación dentro de una misma requisición.",risks:["Caídas de altura","Impacto y proyección","Corte y abrasión"],products:"Arneses y eslingas, cascos, lentes, guantes anticorte, botas de seguridad, chalecos y protección para soldadura."},
    {number:"04",name:"Marítimo, puertos y logística",copy:"En muelles, patios, embarcaciones y centros de distribución confluyen manipulación de carga, movimiento de equipos, lluvia, superficies resbalosas y exposición prolongada a la intemperie. La dotación debe equilibrar visibilidad, agarre, protección mecánica y movilidad durante toda la jornada.",risks:["Manipulación de carga","Intemperie","Ruido industrial"],products:"Guantes de agarre y anticorte, botas impermeables o de seguridad, chalecos de alta visibilidad, protección auditiva y lentes antiempañantes."},
    {number:"05",name:"Minería, metales y talleres",copy:"Procesos de corte, esmerilado, soldadura, fundición y mantenimiento de equipos pesados generan riesgos de partículas, calor, chispas, ruido y bordes filosos. Ayudamos a comparar referencias técnicas para cada estación de trabajo, sin sustituir la evaluación de riesgos del cliente.",risks:["Chispas y metal caliente","Partículas","Ruido"],products:"Guantes para soldadura y anticorte, caretas de soldar, lentes y visores, ropa resistente a la llama, respiradores y orejeras."},
    {number:"06",name:"Manufactura y mantenimiento industrial",copy:"Plantas de producción, líneas de empaque y equipos rotativos requieren una protección que acompañe tareas repetitivas, precisión manual y programas internos de seguridad. Trabajamos con compras y supervisión para consolidar referencias de consumo frecuente y necesidades específicas de mantenimiento.",risks:["Corte y atrapamiento","Partículas","Gases y polvo"],products:"Guantes de protección mecánica, respiradores y filtros, protección visual, auditiva, calzado y prendas de trabajo especializadas."}
  ];
  const industrySchema = {"@context":"https://schema.org","@type":"CollectionPage","@id":`${site.domain}/sectores/#industries`,name:"Industrias atendidas por Maxguantes",url:`${site.domain}/sectores/`,description:"EPP y dotaciones industriales para energía, petroterminales, combustibles, construcción, sector marítimo, minería y manufactura en Panamá.",about:sectors.map(item=>({"@type":"Thing",name:item.name})),provider:{"@id":`${site.domain}/#organization`}};
  const content = `<section class="industries-hero"><img class="industries-hero-bg" src="/assets/industries-hero.webp" width="1672" height="941" fetchpriority="high" alt="Profesionales con equipos de protección personal frente a una terminal industrial, puerto e infraestructura energética"><div class="industries-hero-overlay"></div><div class="container industries-hero-content"><nav class="breadcrumb industries-breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a><span>/</span><span aria-current="page">Industrias</span></nav>${eyebrow("EPP para operaciones industriales",true)}<h1>Protección para el trabajo que mantiene a Panamá en movimiento.</h1><p>Dotaciones y equipos de protección personal para energía, petroterminales, combustibles, construcción, puertos, manufactura y sus contratistas.</p><button class="btn btn-primary" type="button" data-open-quote>Solicitar asesoría para su industria →</button></div></section>
    <section class="section industries-intro"><div class="container split-text"><div>${eyebrow("Una operación, muchos factores")}<h2 class="section-title">La industria define el contexto.<br>La tarea define la protección.</h2></div><div class="prose"><p>Cada operación combina peligros, clima, movilidad, normas internas y ciclos de reposición distintos. Por eso partimos de su frente de trabajo, la exposición y la especificación técnica para ordenar opciones que compras, seguridad y operaciones puedan revisar con mayor claridad.</p><p>Precio, disponibilidad, variantes, tallas y documentación se confirman antes de preparar la propuesta comercial.</p></div></div></section>
    <section class="industries-detail" aria-labelledby="industries-detail-title"><div class="container"><div class="section-head"><div>${eyebrow("Sectores que atendemos")}<h2 class="section-title" id="industries-detail-title">Equipos seleccionados para<br>la realidad de cada industria.</h2><p class="section-intro">Estas son aplicaciones frecuentes. La selección final siempre debe validarse frente a la evaluación de riesgos, las normas vigentes y los procedimientos del cliente.</p></div></div><div class="industry-detail-grid">${sectors.map(item=>`<article class="industry-detail-card"><span class="industry-number">${item.number}</span><h2>${item.name}</h2><p>${item.copy}</p><div class="industry-risk-tags">${item.risks.map(risk=>`<span>${risk}</span>`).join("")}</div><div class="industry-products"><strong>Ejemplos de equipos</strong><p>${item.products}</p></div></article>`).join("")}</div></div></section>
    <section class="section process"><div class="container split-text"><div>${eyebrow("Información útil")}<h2 class="section-title">Para cotizar mejor,<br>necesitamos contexto.</h2></div><div class="prose"><p>Una requisición completa reduce consultas y mejora la comparación entre ofertas. Incluya, cuando sea posible:</p><ul class="check-list"><li>Tarea y riesgo principal</li><li>Norma o especificación exigida</li><li>Marca y SKU si ya están definidos</li><li>Tallas, cantidades y frecuencia</li><li>Fecha y lugar de entrega</li><li>Ficha, fotografía o documento de referencia</li></ul></div></div></section>`;
  return layout({title:"EPP para energía, petroterminales, construcción y más | Maxguantes",description:"Equipos de protección personal y dotaciones industriales en Panamá para energía, petroterminales, combustibles, construcción, puertos, minería y manufactura.",path:"/sectores/",active:"industries",content,schemas:[industrySchema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Industrias",path:"/sectores/"}])],keywords:"EPP energía Panamá, EPP petroterminales, dotaciones industriales, EPP construcción, protección marítima, seguridad industrial Panamá"});
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
  return layout({title:"Servicios de suministro y personalización de EPP | Maxguantes",description:"Cotización de EPP, dotaciones industriales, productos bajo pedido, documentación técnica, personalización y ventas internacionales.",path:"/servicios/",active:"services",content,schemas:[breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Servicios",path:"/servicios/"}])]});
}

export function renderExport() {
  const content = `${pageHero({eyebrowText:"Ventas internacionales",title:"Suministro de protección industrial para proyectos fuera de Panamá.",intro:"Atendemos requerimientos internacionales de EPP, fabricación y referencias especiales, coordinando la propuesta según destino, volumen y condiciones logísticas.",breadcrumb:[{name:"Exportación"}]})}<section class="section export-section"><div class="container split-layout"><div class="image-frame wide"><img src="/assets/international-logistics.webp" width="1920" height="1080" fetchpriority="high" alt="Equipos de protección personal preparados para envío internacional"></div><div class="split-copy">${eyebrow("Alcance internacional")}<h2 class="section-title">Una solicitud clara desde el origen.</h2><p>Evaluamos producto, certificación, cantidad, personalización, país de destino e Incoterm para estructurar cada oferta. Los plazos se confirman después de validar disponibilidad o fabricación.</p><ul class="check-list"><li>Equipos de marcas reconocidas</li><li>Referencias y fabricación especial</li><li>Personalización sujeta a validación</li><li>Documentación comercial y técnica</li><li>Coordinación logística según alcance</li></ul><button class="btn btn-primary" type="button" data-open-quote>Solicitar oferta internacional</button></div></div></section><section class="section process"><div class="container">${eyebrow("Proceso de exportación")}<div class="steps"><article class="step"><span>01</span><h3>Requerimiento</h3><p>Producto, norma, cantidades, destino y fecha requerida.</p></article><article class="step"><span>02</span><h3>Validación</h3><p>Disponibilidad, fabricación, documentación y alternativa logística.</p></article><article class="step"><span>03</span><h3>Oferta</h3><p>Condición comercial, Incoterm, plazo estimado y documentos incluidos.</p></article></div></div></section>`;
  return layout({title:"Exportación de equipos de protección personal | Maxguantes",description:"Ventas internacionales de EPP, ropa ignífuga, guantes y dotaciones industriales desde Panamá para proyectos en Latinoamérica.",path:"/exportacion/",active:"industries",content,schemas:[breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Exportación",path:"/exportacion/"}])],keywords:"exportación EPP, proveedor EPP Latinoamérica, ropa ignífuga exportación"});
}

export function renderResources() {
  const featured = resources.filter(resource => resource.featured);
  const topics = [
    ["01","Elegir la talla","Medición de prendas, guantes y calzado para dotaciones.","/recursos/guia-tallas-portwest/"],
    ["02","Seleccionar guantes","Riesgo, norma, material, agarre, destreza y reposición.","/recursos/seleccion-uso-guantes-seguridad/"],
    ["03","Entender las normas","Lectura responsable de certificaciones europeas y americanas.","/recursos/normas-ropa-ignifuga-arco-electrico/"]
  ];
  const glossary = [["FR","Resistencia a la llama"],["AR","Desempeño ensayado frente al arco"],["ATPV / EBT","Valores usados para declarar arc rating"],["EN 388","Riesgos mecánicos en guantes"],["ANSI/ISEA 105","Clasificación de protección de manos"]];
  const resourceCard = (resource, index, compact = false) => `<article class="resource-card${compact ? " compact" : ""}"><div class="resource-card-meta"><span>${esc(resource.type || "Artículo")}</span><small>${esc(resource.category || "EPP")} · ${esc(resource.readTime)}</small></div><span class="resource-index">${String(index+1).padStart(2,"0")}</span><h${compact ? "3" : "2"}><a href="/recursos/${resource.slug}/">${esc(resource.title)}</a></h${compact ? "3" : "2"}><p>${esc(resource.excerpt)}</p><a class="text-link" href="/recursos/${resource.slug}/">Consultar recurso →</a></article>`;
  const collectionSchema = {"@context":"https://schema.org","@type":"CollectionPage",name:"Centro de recursos sobre equipos de protección personal",description:"Guías técnicas de Maxguantes para seleccionar, comparar y utilizar equipos de protección personal.",url:`${site.domain}/recursos/`,mainEntity:{"@type":"ItemList",itemListElement:resources.map((resource,index)=>({"@type":"ListItem",position:index+1,url:`${site.domain}/recursos/${resource.slug}/`,name:resource.title}))}};
  const content = `${pageHero({eyebrowText:"Centro de recursos",title:"Decisiones de EPP con mejor información.",intro:"Guías claras para medir, seleccionar, comparar normas y preparar requisiciones de protección industrial.",breadcrumb:[{name:"Recursos"}]})}
  <nav class="resource-paths" aria-label="Guías esenciales"><div class="container"><p>Comience por una necesidad</p><div>${topics.map(topic=>`<a href="${topic[3]}"><span>${topic[0]}</span><strong>${topic[1]}</strong><small>${topic[2]}</small><b aria-hidden="true">→</b></a>`).join("")}</div></div></nav>
  <section class="section resource-featured" aria-labelledby="resource-featured-title"><div class="container"><div class="section-head"><div>${eyebrow("Guías esenciales")}<h2 class="section-title" id="resource-featured-title">Respuestas útiles<br>para el trabajo real.</h2><p class="section-intro">Contenido preparado para responsables de seguridad, operaciones, compras y usuarios de equipos de protección personal.</p></div></div><div class="resource-grid featured">${featured.map((resource,index)=>resourceCard(resource,index)).join("")}</div></div></section>
  <section class="resource-glossary" aria-labelledby="resource-glossary-title"><div class="container"><div><span>Referencia rápida</span><h2 id="resource-glossary-title">Cinco términos que no deben confundirse.</h2></div><dl>${glossary.map(item=>`<div><dt>${item[0]}</dt><dd>${item[1]}</dd></div>`).join("")}</dl><p>Una sigla identifica un marco o un resultado; no demuestra por sí sola que el equipo sea adecuado para una tarea.</p></div></section>
  <section class="section resource-library" aria-labelledby="resource-library-title"><div class="container"><div class="section-head compact"><div>${eyebrow("Biblioteca Maxguantes")}<h2 id="resource-library-title">Todas las guías y artículos</h2></div><p>Contenido revisado con referencias del fabricante y organismos técnicos. Consulte siempre la edición vigente exigida por su organización.</p></div><div class="resource-grid library">${resources.map((resource,index)=>resourceCard(resource,index,true)).join("")}</div></div></section>
  <section class="resource-help"><div class="container"><div><span>¿No encuentra la respuesta?</span><h2>Envíenos la norma, tarea o referencia que está evaluando.</h2></div><div class="button-row"><a class="btn btn-primary" href="/contacto/">Consultar al equipo →</a><a class="btn btn-outline" href="/productos/">Explorar productos</a></div></div></section>`;
  return layout({title:"Guías de EPP, tallas y certificaciones | Maxguantes Panamá",description:"Centro técnico sobre tallas Portwest, selección de guantes, EN 388, ANSI/ISEA 105, NFPA 70E, NFPA 2112, ASTM F1506 e IEC 61482.",path:"/recursos/",active:"resources",content,schemas:[collectionSchema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Recursos",path:"/recursos/"}])],keywords:"guía EPP Panamá, tallas Portwest, EN 388, ANSI ISEA 105, NFPA 70E, NFPA 2112, ASTM F1506, IEC 61482"});
}

export function renderResource(resource) {
  const articleSchema = {"@context":"https://schema.org","@type":"TechArticle",headline:resource.title,datePublished:resource.date,dateModified:resource.updated || resource.date,author:{"@id":`${site.domain}/#organization`},publisher:{"@id":`${site.domain}/#organization`},mainEntityOfPage:`${site.domain}/recursos/${resource.slug}/`,description:resource.excerpt,inLanguage:"es-PA",about:resource.category || "Equipos de protección personal"};
  const faqSchema = resource.faq?.length ? {"@context":"https://schema.org","@type":"FAQPage",mainEntity:resource.faq.map(([question,answer])=>({"@type":"Question",name:question,acceptedAnswer:{"@type":"Answer",text:answer}}))} : null;
  const renderDetails = details => {
    if (!details) return "";
    const bullets = details.bullets?.length ? `<ul class="article-list">${details.bullets.map(item=>`<li>${esc(item)}</li>`).join("")}</ul>` : "";
    const checklist = details.checklist?.length ? `<div class="article-checklist"><strong>Lista de verificación</strong><ul>${details.checklist.map(item=>`<li>${esc(item)}</li>`).join("")}</ul></div>` : "";
    const table = details.table ? `<div class="article-table-wrap"><table><thead><tr>${details.table.headers.map(item=>`<th scope="col">${esc(item)}</th>`).join("")}</tr></thead><tbody>${details.table.rows.map(row=>`<tr>${row.map((item,index)=>`<${index ? "td" : "th"}${index ? "" : ' scope="row"'}>${esc(item)}</${index ? "td" : "th"}>`).join("")}</tr>`).join("")}</tbody></table></div>` : "";
    const note = details.note ? `<aside class="article-note"><strong>Importante</strong><p>${esc(details.note)}</p></aside>` : "";
    return `${bullets}${table}${checklist}${note}`;
  };
  const sections = resource.body.map(([heading,text,details])=>`<section id="${anchorId(heading)}"><h2>${esc(heading)}</h2><p>${esc(text)}</p>${renderDetails(details)}</section>`).join("");
  const sources = resource.links?.length ? `<section class="article-sources" aria-labelledby="sources-title"><h2 id="sources-title">Fuentes y consultas oficiales</h2><p>Enlaces externos para comprobar alcance, ediciones y documentación vigente.</p><ul>${resource.links.map(link=>`<li><a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} <span aria-hidden="true">↗</span></a></li>`).join("")}</ul></section>` : "";
  const faq = resource.faq?.length ? `<section class="article-faq" aria-labelledby="faq-title"><h2 id="faq-title">Preguntas frecuentes</h2>${resource.faq.map(([question,answer])=>`<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join("")}</section>` : "";
  const content = `<article class="article"><header class="article-header"><div class="container article-header-inner"><nav class="breadcrumb dark" aria-label="Migas de pan"><a href="/">Inicio</a><span>/</span><a href="/recursos/">Recursos</a><span>/</span><span aria-current="page">${esc(resource.category || "Guía")}</span></nav><div class="article-heading"><div>${eyebrow(esc(resource.type || "Guía técnica"),true)}<h1>${esc(resource.title)}</h1><p>${esc(resource.excerpt)}</p><div class="article-meta"><span>Publicado: ${new Date(resource.date).toLocaleDateString("es-PA",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"})}</span><span>Revisado: ${new Date(resource.updated || resource.date).toLocaleDateString("es-PA",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"})}</span><span>Lectura: ${esc(resource.readTime)}</span></div></div><div class="article-code" aria-hidden="true"><span>${esc(resource.category || "EPP")}</span><strong>${String(resources.indexOf(resource)+1).padStart(2,"0")}</strong></div></div></div></header><div class="container article-layout"><aside class="article-toc"><strong>En esta guía</strong><nav>${resource.body.map(([heading])=>`<a href="#${anchorId(heading)}">${esc(heading)}</a>`).join("")}${resource.faq?.length ? '<a href="#faq-title">Preguntas frecuentes</a>' : ""}${resource.links?.length ? '<a href="#sources-title">Fuentes oficiales</a>' : ""}</nav><a class="text-link" href="/recursos/">← Todos los recursos</a></aside><div class="article-body">${sections}${faq}${sources}<aside class="article-callout"><h2>¿Necesita validar una referencia?</h2><p>Comparta la tarea, la norma, la ficha y las condiciones de uso. Le ayudamos a organizar la solicitud para revisión de su responsable de seguridad.</p><button class="btn btn-primary" type="button" data-open-quote>Consultar con Maxguantes</button></aside><p class="article-disclaimer">Contenido informativo y no sustitutivo de una evaluación de riesgos. La selección final debe ser aprobada por personal competente, conforme a la legislación, procedimientos internos, instrucciones del fabricante y edición vigente de las normas aplicables.</p></div></div></article>`;
  return layout({title:`${resource.title} | Maxguantes`,description:resource.excerpt,path:`/recursos/${resource.slug}/`,active:"resources",content,schemas:[articleSchema,faqSchema,breadcrumbSchema([{name:"Inicio",path:"/"},{name:"Recursos",path:"/recursos/"},{name:resource.title,path:`/recursos/${resource.slug}/`}])].filter(Boolean),bodyClass:"article-page",keywords:`${resource.category || "EPP"}, seguridad industrial, Maxguantes Panamá`});
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
