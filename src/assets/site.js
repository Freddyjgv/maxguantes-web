(() => {
  "use strict";

  const storageKey = "maxguantes_quote_v1";
  const body = document.body;
  const nav = document.querySelector(".nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const quotePanel = document.querySelector(".quote-panel");
  const quoteItems = document.querySelector(".quote-items");
  const quoteProductsInput = document.querySelector("[data-quote-products]");
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
  ).map(item => ({ ...item, quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1) }));

  function persistQuote() {
    localStorage.setItem(storageKey, JSON.stringify(quote));
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
      counter.setAttribute("aria-label", `${quote.length} productos agregados`);
    });

    if (quoteProductsInput) {
      quoteProductsInput.value = quote.map(item => `${item.code} — ${item.name} — Cantidad: ${item.quantity}`).join("\n");
    }

    if (!quoteItems) return;
    quoteItems.replaceChildren();

    if (!quote.length) {
      const empty = makeElement("div", "quote-empty");
      empty.append(makeElement("strong", "", "La lista está vacía"));
      empty.append(makeElement("p", "", "Agregue productos desde el catálogo o describa directamente su necesidad en el formulario."));
      quoteItems.append(empty);
      return;
    }

    quote.forEach((item, index) => {
      const row = makeElement("div", "quote-item");
      const image = document.createElement("img");
      image.src = item.image || "/assets/logo.webp";
      image.alt = "";
      image.width = 62;
      image.height = 62;

      const info = makeElement("div");
      info.append(makeElement("small", "", item.code));
      info.append(makeElement("strong", "", item.name));
      const quantityLabel = makeElement("label", "quote-quantity");
      quantityLabel.append(makeElement("span", "", "Cantidad"));
      const quantity = document.createElement("input");
      quantity.type = "number";
      quantity.min = "1";
      quantity.value = String(item.quantity);
      quantity.setAttribute("aria-label", `Cantidad de ${item.name}`);
      quantity.addEventListener("change", () => {
        item.quantity = Math.max(1, Number.parseInt(quantity.value, 10) || 1);
        quantity.value = String(item.quantity);
        persistQuote();
        if (quoteProductsInput) quoteProductsInput.value = quote.map(product => `${product.code} — ${product.name} — Cantidad: ${product.quantity}`).join("\n");
      });
      quantityLabel.append(quantity);
      info.append(quantityLabel);

      const remove = makeElement("button", "remove-item", "×");
      remove.type = "button";
      remove.setAttribute("aria-label", `Eliminar ${item.name}`);
      remove.addEventListener("click", () => {
        quote.splice(index, 1);
        persistQuote();
        renderQuote();
        notify("Producto eliminado de la solicitud");
      });
      row.append(image, info, remove);
      quoteItems.append(row);
    });
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

  document.querySelectorAll(".add-quote").forEach(button => {
    button.addEventListener("click", () => {
      const item = {
        code: button.dataset.code || "Referencia",
        name: button.dataset.name || "Producto",
        image: button.dataset.image || "",
        quantity: 1
      };
      if (!quote.some(product => product.code === item.code)) {
        quote.push(item);
        persistQuote();
        renderQuote();
        notify(`${item.code} agregado a la solicitud`);
        track("add_to_quote", { item_id: item.code, item_name: item.name });
      } else {
        notify(`${item.code} ya está en la solicitud`);
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
      ...quote.flatMap((item, index) => [`*${index + 1}. ${item.code} — ${item.name}*`, `   Cantidad: ${item.quantity}`, ""]),
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
  const filters = [...document.querySelectorAll("[data-filter]")];
  const cards = [...document.querySelectorAll("[data-product-card]")];
  const resultCount = document.querySelector("[data-result-count]");
  const noResults = document.querySelector("[data-no-results]");
  let activeFilter = "all";

  function filterProducts() {
    const term = (search?.value || "").toLowerCase().trim();
    let visible = 0;
    cards.forEach(card => {
      const productCategories = (card.dataset.categories || "").split(/\s+/).filter(Boolean);
      const matchesCategory = activeFilter === "all" || productCategories.includes(activeFilter);
      const searchable = `${card.dataset.name || ""} ${card.dataset.sku || ""} ${card.dataset.brand || ""} ${card.dataset.certifications || ""}`;
      const matchesTerm = !term || searchable.includes(term);
      const show = matchesCategory && matchesTerm;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (resultCount) resultCount.textContent = `${visible} ${visible === 1 ? "producto publicado" : "productos publicados"}`;
    if (noResults) noResults.hidden = visible !== 0;
  }

  search?.addEventListener("input", filterProducts);
  filters.forEach(filter => filter.addEventListener("click", () => {
    activeFilter = filter.dataset.filter || "all";
    filters.forEach(item => item.classList.toggle("active", item === filter));
    filterProducts();
  }));

  document.querySelectorAll("form").forEach(form => {
    form.addEventListener("submit", () => {
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
