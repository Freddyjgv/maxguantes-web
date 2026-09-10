(() => {
  "use strict";

  const storageKey = "maxguantes_quote_v1";
  const body = document.body;
  const nav = document.querySelector(".nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const quotePanel = document.querySelector(".quote-panel");
  const quoteItems = document.querySelector(".quote-items");
  const requestItems = document.querySelector("[data-request-items]");
  const quoteSummary = document.querySelector("[data-quote-summary]");
  const toast = document.querySelector(".toast");
  let previousFocus = null;
  let toastTimer = null;

  function track(eventName, parameters = {}) {
    if (typeof window.gtag === "function") window.gtag("event", eventName, parameters);
  }

  const safeParse = (value, fallback) => {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  let quote = safeParse(localStorage.getItem(storageKey), []).filter(item =>
    item && typeof item.code === "string" && typeof item.name === "string"
  ).map(item => ({
    ...item,
    key: String(item.key || `${item.code}::${item.variantLabel || item.sizes || "base"}`),
    variantLabel: String(item.variantLabel || ""),
    variantAttributes: item.variantAttributes && typeof item.variantAttributes === "object" ? item.variantAttributes : {},
    variantId: item.variantId || null,
    parentCode: String(item.parentCode || item.code),
    dolibarrProductId: item.dolibarrProductId || null,
    dolibarrRef: String(item.dolibarrRef || ""),
    quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
    sizes: String(item.sizes || ""),
    note: String(item.note || "")
  }));

  function persistQuote() {
    localStorage.setItem(storageKey, JSON.stringify(quote));
  }

  const totalUnits = () => quote.reduce((sum, item) => sum + item.quantity, 0);

  function serializedQuote() {
    return quote.map(item => [
      `${item.code} — ${item.name}`,
      item.variantLabel ? `Variante: ${item.variantLabel}` : "",
      item.dolibarrRef ? `Referencia Dolibarr: ${item.dolibarrRef}` : "",
      item.dolibarrProductId ? `ID Dolibarr: ${item.dolibarrProductId}` : "",
      `Cantidad: ${item.quantity}`,
      item.sizes ? `Tallas/distribución: ${item.sizes}` : "",
      item.note ? `Observación: ${item.note}` : ""
    ].filter(Boolean).join(" — ")).join("\n");
  }

  function syncQuoteFields() {
    document.querySelectorAll("[data-quote-products]").forEach(input => { input.value = serializedQuote(); });
  }

  function setQuantity(item, value, rerender = true) {
    item.quantity = Math.min(9999, Math.max(1, Number.parseInt(value, 10) || 1));
    persistQuote();
    syncQuoteFields();
    if (rerender) renderQuote();
  }

  function notify(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderQuote() {
    document.querySelectorAll(".quote-count").forEach(counter => {
      counter.textContent = String(quote.length);
      counter.setAttribute("aria-label", `${quote.length} referencias agregadas`);
    });
    syncQuoteFields();
    if (quoteSummary) quoteSummary.textContent = `${quote.length} ${quote.length === 1 ? "referencia" : "referencias"} · ${totalUnits()} ${totalUnits() === 1 ? "unidad" : "unidades"}`;
    [quoteItems, requestItems].filter(Boolean).forEach(container => container.replaceChildren());
    if (!quote.length) {
      [quoteItems, requestItems].filter(Boolean).forEach(container => {
        const empty = makeElement("div", "quote-empty");
        empty.append(makeElement("strong", "", "La solicitud está vacía"));
        empty.append(makeElement("p", "", "Agregue referencias desde nuestro catálogo para preparar su cotización."));
        const link = makeElement("a", "btn btn-primary", "Explorar productos");
        link.href = "/productos/";
        empty.append(link);
        container.append(empty);
      });
      return;
    }
    quote.forEach((item, index) => {
      if (quoteItems) quoteItems.append(buildQuoteRow(item, index, false));
      if (requestItems) requestItems.append(buildQuoteRow(item, index, true));
    });
  }

  function buildQuoteRow(item, index, detailed) {
    const row = makeElement("article", detailed ? "request-item" : "quote-item quote-item-compact");
    const info = makeElement("div", "quote-item-info");
    info.append(makeElement("small", "", item.code));
    info.append(makeElement("strong", "", item.name));
    if (item.variantLabel) info.append(makeElement("span", "quote-variant", item.variantLabel));
    const controls = makeElement("div", "inline-quantity");
    const minus = makeElement("button", "", "−");
    const quantity = document.createElement("input");
    const plus = makeElement("button", "", "+");
    minus.type = plus.type = "button";
    minus.setAttribute("aria-label", `Reducir cantidad de ${item.name}`);
    plus.setAttribute("aria-label", `Aumentar cantidad de ${item.name}`);
    quantity.type = "number"; quantity.min = "1"; quantity.max = "9999"; quantity.value = String(item.quantity);
    quantity.setAttribute("aria-label", `Cantidad de ${item.name}`);
    minus.addEventListener("click", () => setQuantity(item, item.quantity - 1));
    plus.addEventListener("click", () => setQuantity(item, item.quantity + 1));
    quantity.addEventListener("change", () => setQuantity(item, quantity.value));
    controls.append(minus, quantity, plus);
    const remove = makeElement("button", "remove-item", "Eliminar");
    remove.type = "button";
    remove.setAttribute("aria-label", `Eliminar ${item.name}`);
    remove.addEventListener("click", () => {
      quote.splice(index, 1); persistQuote(); renderQuote(); notify("Producto eliminado de la solicitud");
    });
    if (!detailed) { row.append(info, controls, remove); return row; }
    const image = document.createElement("img");
    image.src = item.image || "/assets/product-placeholder.svg"; image.alt = ""; image.width = 96; image.height = 96;
    const fields = makeElement("div", "request-item-fields");
    const sizesLabel = makeElement("label", "", item.variantLabel ? "Distribución adicional (opcional)" : "Tallas o distribución (opcional)");
    const sizes = document.createElement("input"); sizes.value = item.sizes; sizes.placeholder = item.variantLabel ? "Ej.: 5 unidades adicionales talla M" : "Ej.: 5 M, 10 L, 4 XL";
    sizes.addEventListener("input", () => { item.sizes = sizes.value; persistQuote(); syncQuoteFields(); });
    sizesLabel.append(sizes);
    const noteLabel = makeElement("label", "", "Observación (opcional)");
    const note = document.createElement("input"); note.value = item.note; note.placeholder = "Color, norma o condición especial";
    note.addEventListener("input", () => { item.note = note.value; persistQuote(); syncQuoteFields(); });
    noteLabel.append(note); fields.append(sizesLabel, noteLabel);
    const main = makeElement("div", "request-item-main"); main.append(info, controls, fields);
    row.append(image, main, remove); return row;
  }

  function openQuote() {
    if (!quotePanel) return;
    previousFocus = document.activeElement;
    body.classList.add("drawer-open");
    quotePanel.setAttribute("aria-hidden", "false");
    window.setTimeout(() => quotePanel.querySelector(".close-drawer")?.focus(), 100);
  }

  function closeQuote() {
    if (!quotePanel) return;
    body.classList.remove("drawer-open");
    quotePanel.setAttribute("aria-hidden", "true");
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  }

  document.querySelectorAll("[data-open-quote]").forEach(button => button.addEventListener("click", openQuote));
  document.querySelectorAll("[data-close-quote]").forEach(button => button.addEventListener("click", closeQuote));

  document.querySelectorAll("[data-quantity-minus], [data-quantity-plus]").forEach(button => {
    button.addEventListener("click", () => {
      const picker = button.closest(".quantity-picker");
      const input = picker?.querySelector("[data-product-quantity]");
      if (!input) return;
      const delta = button.hasAttribute("data-quantity-plus") ? 1 : -1;
      input.value = String(Math.min(9999, Math.max(1, (Number.parseInt(input.value, 10) || 1) + delta)));
    });
  });

  const readVariant = (container, button) => {
    const selector = container?.querySelector("[data-product-variant]");
    const selected = selector?.selectedOptions?.[0];
    const custom = container?.querySelector("[data-product-custom-variant]");
    let attributes = {};
    try { attributes = JSON.parse(selected?.dataset.variantAttributes || "{}"); } catch { attributes = {}; }
    const customLabel = String(custom?.value || "").trim();
    return {
      code: selected?.value || button.dataset.code || "Referencia",
      label: selected?.dataset.variantLabel || customLabel,
      attributes,
      id: selected?.dataset.variantId || null,
      dolibarrProductId: selected?.dataset.dolibarrProductId || button.dataset.dolibarrProductId || null,
      dolibarrRef: selected?.dataset.dolibarrRef || button.dataset.dolibarrRef || ""
    };
  };

  document.querySelectorAll(".add-quote").forEach(button => {
    button.addEventListener("click", () => {
      const container = button.closest(".product-body, .product-summary");
      const requestedQuantity = Math.max(1, Number.parseInt(container?.querySelector("[data-product-quantity]")?.value, 10) || 1);
      const variant = readVariant(container, button);
      const parentCode = button.dataset.code || "Referencia";
      const item = {
        key: `${parentCode}::${variant.code}::${variant.label || "base"}`,
        code: variant.code,
        parentCode,
        name: button.dataset.name || "Producto",
        image: button.dataset.image || "",
        variantLabel: variant.label,
        variantAttributes: variant.attributes,
        variantId: variant.id,
        dolibarrProductId: variant.dolibarrProductId,
        dolibarrRef: variant.dolibarrRef,
        quantity: requestedQuantity,
        sizes: "",
        note: ""
      };
      const existing = quote.find(product => product.key === item.key);
      if (!existing) {
        quote.push(item);
        persistQuote();
        renderQuote();
        notify(`${item.code} agregado a la solicitud`);
        track("add_to_quote", { item_id: item.code, item_name: item.name });
      } else {
        existing.quantity = Math.min(9999, existing.quantity + requestedQuantity);
        persistQuote(); renderQuote(); notify(`Cantidad de ${item.code} actualizada`);
      }
      openQuote();
    });
  });

  const certificationTooltips = [...document.querySelectorAll(".cert-tooltip")];
  const closeCertificationTooltips = (except = null) => {
    certificationTooltips.forEach(tooltip => {
      if (tooltip === except) return;
      tooltip.classList.remove("is-open");
      tooltip.querySelector(".cert-pill")?.setAttribute("aria-expanded", "false");
    });
  };
  certificationTooltips.forEach(tooltip => {
    const trigger = tooltip.querySelector(".cert-pill");
    trigger?.addEventListener("click", event => {
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      event.stopPropagation();
      const willOpen = !tooltip.classList.contains("is-open");
      closeCertificationTooltips(tooltip);
      tooltip.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
  });
  document.addEventListener("click", () => closeCertificationTooltips());

  document.querySelector("[data-quote-whatsapp]")?.addEventListener("click", () => {
    const form = document.querySelector("[data-quote-form]");
    if (!quote.length) {
      notify("Agregue al menos un producto a la solicitud");
      return;
    }
    if (!form?.reportValidity()) return;
    const data = new FormData(form);
    const lines = [
      "*SOLICITUD DE COTIZACIÓN - MAXGUANTES*",
      `*Cliente:* ${data.get("nombre") || ""}`,
      `*Empresa:* ${data.get("empresa") || ""}`,
      `*Teléfono:* ${data.get("telefono") || ""}`,
      `*Email:* ${data.get("email") || ""}`,
      "------------------------------------------",
      ...quote.flatMap((item, index) => [`*${index + 1}. ${item.code} — ${item.name}*`, item.variantLabel ? `   Variante: ${item.variantLabel}` : "", item.dolibarrRef ? `   Ref. Dolibarr: ${item.dolibarrRef}` : "", item.dolibarrProductId ? `   ID Dolibarr: ${item.dolibarrProductId}` : "", `   Cantidad: ${item.quantity}`, item.sizes ? `   Tallas/distribución: ${item.sizes}` : "", item.note ? `   Observación: ${item.note}` : "", ""]),
      "------------------------------------------",
      data.get("mensaje") ? `*Información adicional:* ${data.get("mensaje")}` : "",
      "_Enviado desde maxguantes.com_"
    ].filter(Boolean);
    const whatsappUrl = `https://wa.me/50764335738?text=${encodeURIComponent(lines.join("\n"))}`;
    track("quote_whatsapp", { items: quote.length });
    window.open(whatsappUrl, "_blank", "noopener");
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeQuote();
      closeCertificationTooltips();
      nav?.classList.remove("open");
      menuToggle?.setAttribute("aria-expanded", "false");
    }
    if (event.key === "Tab" && body.classList.contains("drawer-open") && quotePanel) {
      const focusable = [...quotePanel.querySelectorAll('a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea')]
        .filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  menuToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("open") || false;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));

  const search = document.querySelector("[data-product-search]");
  const categoryFilters = [...document.querySelectorAll("[data-filter-category]")];
  const brandFilters = [...document.querySelectorAll("[data-filter-brand]")];
  const catalogGrid = document.querySelector("[data-product-grid]");
  const cards = [...document.querySelectorAll("[data-product-card]")];
  const resultCount = document.querySelector("[data-result-count]");
  const noResults = document.querySelector("[data-no-results]");
  const pagination = document.querySelector("[data-pagination]");
  const pageNumbers = document.querySelector("[data-page-numbers]");
  const pagePrevious = document.querySelector("[data-page-prev]");
  const pageNext = document.querySelector("[data-page-next]");
  const activeFilters = document.querySelector("[data-active-filters]");
  const pageSize = 18;
  let activeCategory = "all";
  let activeBrand = "all";
  let currentPage = 1;

  const normalizeSearch = value => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const buttonLabel = button => button ? [...button.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join(" ").trim() : "";

  function readCatalogUrl() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("categoria") || "all";
    const brand = params.get("marca") || "all";
    activeCategory = categoryFilters.some(button => button.dataset.filterCategory === category) ? category : "all";
    activeBrand = brandFilters.some(button => button.dataset.filterBrand === brand) ? brand : "all";
    currentPage = Math.max(1, Number.parseInt(params.get("pagina"), 10) || 1);
    if (search) search.value = params.get("q") || "";
  }

  function writeCatalogUrl(mode = "replace") {
    const url = new URL(window.location.href);
    const term = search?.value.trim() || "";
    activeCategory === "all" ? url.searchParams.delete("categoria") : url.searchParams.set("categoria", activeCategory);
    activeBrand === "all" ? url.searchParams.delete("marca") : url.searchParams.set("marca", activeBrand);
    term ? url.searchParams.set("q", term) : url.searchParams.delete("q");
    currentPage > 1 ? url.searchParams.set("pagina", String(currentPage)) : url.searchParams.delete("pagina");
    history[mode === "push" ? "pushState" : "replaceState"]({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function matchesSearch(card, term) {
    const searchable = normalizeSearch(`${card.dataset.name || ""} ${card.dataset.sku || ""} ${card.dataset.brand || ""} ${card.dataset.certifications || ""}`);
    return !term || searchable.includes(term);
  }

  function updateFilterButtons(term) {
    categoryFilters.forEach(button => {
      const value = button.dataset.filterCategory || "all";
      const count = cards.filter(card => {
        const categories = (card.dataset.categories || "").split(/\s+/).filter(Boolean);
        return (activeBrand === "all" || card.dataset.brandSlug === activeBrand) && matchesSearch(card, term) && (value === "all" || categories.includes(value));
      }).length;
      button.querySelector("span").textContent = String(count);
      button.classList.toggle("active", value === activeCategory);
      button.setAttribute("aria-pressed", String(value === activeCategory));
      button.disabled = count === 0 && value !== activeCategory;
    });
    brandFilters.forEach(button => {
      const value = button.dataset.filterBrand || "all";
      const count = cards.filter(card => {
        const categories = (card.dataset.categories || "").split(/\s+/).filter(Boolean);
        return (activeCategory === "all" || categories.includes(activeCategory)) && matchesSearch(card, term) && (value === "all" || card.dataset.brandSlug === value);
      }).length;
      button.querySelector("span").textContent = String(count);
      button.classList.toggle("active", value === activeBrand);
      button.setAttribute("aria-pressed", String(value === activeBrand));
      button.disabled = count === 0 && value !== activeBrand;
    });
  }

  function renderActiveFilters(term) {
    if (!activeFilters) return;
    activeFilters.replaceChildren();
    const add = (label, clear) => {
      const button = makeElement("button", "active-filter", `${label} ×`);
      button.type = "button";
      button.addEventListener("click", () => {
        clear();
        currentPage = 1;
        renderCatalog({ urlMode: "push" });
      });
      activeFilters.append(button);
    };
    if (activeCategory !== "all") add(`Categoría: ${buttonLabel(categoryFilters.find(button => button.dataset.filterCategory === activeCategory))}`, () => { activeCategory = "all"; });
    if (activeBrand !== "all") add(`Marca: ${buttonLabel(brandFilters.find(button => button.dataset.filterBrand === activeBrand))}`, () => { activeBrand = "all"; });
    if (term) add(`Búsqueda: ${search.value.trim()}`, () => { search.value = ""; });
  }

  function renderPageNumbers(totalPages) {
    if (!pageNumbers) return;
    pageNumbers.replaceChildren();
    const pages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(page => page >= 1 && page <= totalPages))];
    pages.forEach((page, index) => {
      if (index && page - pages[index - 1] > 1) pageNumbers.append(makeElement("span", "pagination-gap", "…"));
      const button = makeElement("button", "", String(page));
      button.type = "button";
      button.setAttribute("aria-label", `Página ${page}`);
      if (page === currentPage) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => changePage(page));
      pageNumbers.append(button);
    });
  }

  function changePage(page) {
    currentPage = page;
    renderCatalog({ urlMode: "push" });
    document.querySelector("#catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderCatalog({ urlMode = "replace" } = {}) {
    if (!cards.length) return;
    const term = normalizeSearch(search?.value);
    const matched = cards.filter(card => {
      const categories = (card.dataset.categories || "").split(/\s+/).filter(Boolean);
      return (activeCategory === "all" || categories.includes(activeCategory)) && (activeBrand === "all" || card.dataset.brandSlug === activeBrand) && matchesSearch(card, term);
    });
    const totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const visibleCards = new Set(matched.slice((currentPage - 1) * pageSize, currentPage * pageSize));
    cards.forEach(card => { card.hidden = !visibleCards.has(card); });
    if (resultCount) resultCount.textContent = matched.length ? `${matched.length} ${matched.length === 1 ? "producto" : "productos"} · Página ${currentPage} de ${totalPages}` : "0 productos";
    if (noResults) noResults.hidden = matched.length !== 0;
    if (pagination) pagination.hidden = matched.length === 0 || totalPages <= 1;
    if (pagePrevious) { pagePrevious.disabled = currentPage === 1; pagePrevious.onclick = () => changePage(currentPage - 1); }
    if (pageNext) { pageNext.disabled = currentPage === totalPages; pageNext.onclick = () => changePage(currentPage + 1); }
    renderPageNumbers(totalPages);
    renderActiveFilters(term);
    updateFilterButtons(term);
    writeCatalogUrl(urlMode);
  }

  search?.addEventListener("input", () => {
    currentPage = 1;
    renderCatalog();
  });
  categoryFilters.forEach(button => button.addEventListener("click", () => {
    activeCategory = button.dataset.filterCategory || "all";
    currentPage = 1;
    renderCatalog({ urlMode: "push" });
  }));
  brandFilters.forEach(button => button.addEventListener("click", () => {
    activeBrand = button.dataset.filterBrand || "all";
    currentPage = 1;
    renderCatalog({ urlMode: "push" });
  }));
  document.querySelectorAll("[data-clear-catalog]").forEach(button => button.addEventListener("click", () => {
    activeCategory = "all";
    activeBrand = "all";
    currentPage = 1;
    if (search) search.value = "";
    renderCatalog({ urlMode: "push" });
  }));
  window.addEventListener("popstate", () => {
    readCatalogUrl();
    renderCatalog();
  });
  if (catalogGrid && cards.length) {
    readCatalogUrl();
    renderCatalog();
  }

  document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", event => {
      if (form.matches("[data-quote-form]") && !quote.length) {
        event.preventDefault();
        notify("Agregue al menos un producto a la solicitud");
        return;
      }
      track("generate_lead", { form_name: form.getAttribute("name") || "formulario" });
      form.querySelectorAll('button[type="submit"]').forEach(button => {
        button.disabled = true;
        button.textContent = "Enviando…";
      });
    });
  });

  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => link.addEventListener("click", () => track("whatsapp_click", { link_text: link.textContent.trim() })));

  renderQuote();
})();
