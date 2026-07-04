/* ============================================================
   CAFE ROX — APPLICATION LOGIC
   ============================================================
   This file reads data from data/settings.js and data/menu.js
   and renders every component on the page, then wires up
   cart, search, filter and WhatsApp ordering behaviour.

   TABLE OF CONTENTS
   1. App State
   2. Cart Manager        (add / remove / totals / persistence hook)
   3. Renderers            (Navbar, Hero, Toolbar, Products, Cart, Footer)
   4. Search & Filter Logic
   5. Order Manager        (builds & sends the WhatsApp message)
   6. Event Wiring & Init

   EXTENSION POINTS
   Search for "EXTENSION POINT" comments — these mark the best
   places to plug in a login system, Firebase database, order
   tracking, an admin dashboard, or support for multiple cafe
   branches without restructuring this file.
   ============================================================ */


/* ============================================================
   1. APP STATE
   ============================================================ */
const AppState = {
  cartOrder: [],        // ordered list of product ids, in the order they were added
  cart: {},             // { productId: quantity }
  activeCategory: "all",
  searchQuery: "",
};


/* ============================================================
   2. CART MANAGER
   ------------------------------------------------------------
   All cart math and mutations live here. Keeping this isolated
   means a future Firebase sync or login-linked cart only needs
   to hook into these functions, not the rendering code.
   ============================================================ */
const CartManager = {

  add(productId) {
    AppState.cart[productId] = (AppState.cart[productId] || 0) + 1;
    AppState.cartOrder.push(productId);
    this.onChange();
  },

  removeLast() {
    if (AppState.cartOrder.length === 0) return;
    const lastId = AppState.cartOrder.pop();
    AppState.cart[lastId] -= 1;
    if (AppState.cart[lastId] <= 0) delete AppState.cart[lastId];
    this.onChange();
  },

  removeProduct(productId) {
    delete AppState.cart[productId];
    AppState.cartOrder = AppState.cartOrder.filter(id => id !== productId);
    this.onChange();
  },

  clear() {
    AppState.cart = {};
    AppState.cartOrder = [];
    this.onChange();
  },

  getTotalItemCount() {
    return Object.values(AppState.cart).reduce((sum, qty) => sum + qty, 0);
  },

  getSubtotal() {
    return Object.entries(AppState.cart).reduce((sum, [id, qty]) => {
      const product = MENU_ITEMS.find(item => item.id == id);
      return product ? sum + product.price * qty : sum;
    }, 0);
  },

  getDeliveryCharge() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    if (CAFE_SETTINGS.freeDeliveryAbove && subtotal >= CAFE_SETTINGS.freeDeliveryAbove) return 0;
    return CAFE_SETTINGS.deliveryCharge;
  },

  getTax() {
    const subtotal = this.getSubtotal();
    return Math.round((subtotal * CAFE_SETTINGS.taxPercent) / 100);
  },

  getGrandTotal() {
    return this.getSubtotal() + this.getDeliveryCharge() + this.getTax();
  },

  // Called after every cart mutation. Currently just re-renders
  // the cart panel — this is where you would also push the
  // updated cart to Firebase, localStorage, or a logged-in
  // user's saved order in the future.
  onChange() {
    // EXTENSION POINT: sync AppState.cart to a backend/session here
    Renderer.renderCartPanel();
  },
};


/* ============================================================
   3. RENDERERS
   ------------------------------------------------------------
   Each function owns exactly one component and reads its data
   straight from CAFE_SETTINGS / MENU_ITEMS / AppState. Re-run
   any single render*() function whenever that component's data
   changes — you never need to reload the page.
   ============================================================ */
const Renderer = {

  /* ---------- Navbar ---------- */
  renderNavbar() {
    const root = document.getElementById("navbar-root");
    root.innerHTML = `
      <div class="navbar__brand">
        <img class="navbar__logo" src="${CAFE_SETTINGS.logo}" alt="${CAFE_SETTINGS.cafeName} logo">
        <div class="navbar__brand-text">
          <h1>${CAFE_SETTINGS.cafeName}</h1>
          <span>${CAFE_SETTINGS.tagline.toUpperCase()}</span>
        </div>
      </div>

      <button class="navbar__toggle" id="navbar-toggle" aria-label="Toggle menu">☰</button>

      <nav class="navbar__links" id="navbar-links">
        <a class="navbar__link is-active" href="#home">🏠 Home</a>
        <a class="navbar__link" href="#menu">☕ Menu</a>
        <a class="navbar__link" href="#about">👥 About Us</a>
        <a class="navbar__link" href="#contact">📞 Contact</a>
      </nav>

      <button class="navbar__cart-btn" id="navbar-cart-btn">
        🛒 Cart (<span id="navbar-cart-count">0</span>)
      </button>
    `;
  },

  /* ---------- Hero ---------- */
  renderHero() {
    const root = document.getElementById("hero-root");
    root.style.backgroundImage = `url('${CAFE_SETTINGS.heroBackground}')`;
    root.innerHTML = `
      <div class="hero__content">
        <div class="hero__eyebrow">— ${CAFE_SETTINGS.heroEyebrow} —</div>
        <h1 class="hero__title">${CAFE_SETTINGS.heroTitle}</h1>
        <div class="hero__subtitle">${CAFE_SETTINGS.heroSubtitle}</div>
        <div class="hero__icon">☕</div>
      </div>
    `;
  },

  /* ---------- Search & Filter Toolbar ---------- */
  renderToolbar() {
    const root = document.getElementById("toolbar-root");
    const categoryButtons = MENU_CATEGORIES.map(cat => `
      <button
        class="filter-btn ${cat.id === AppState.activeCategory ? "is-active" : ""}"
        data-category="${cat.id}">
        ${cat.label}
      </button>
    `).join("");

    root.innerHTML = `
      <div class="search-box">
        <span class="search-box__icon">🔍</span>
        <input
          type="text"
          id="menu-search-input"
          placeholder="Search the menu... (e.g. latte, burger)"
          value="${AppState.searchQuery}">
      </div>
      <div class="filter-bar" id="filter-bar">
        ${categoryButtons}
      </div>
    `;
  },

  /* ---------- Product Cards ---------- */
  renderProducts() {
    const root = document.getElementById("menu-grid");
    const items = SearchFilter.getVisibleItems();

    if (items.length === 0) {
      root.innerHTML = `
        <div class="menu-empty-state">
          No items match your search. Try a different keyword or category.
        </div>`;
      return;
    }

    root.innerHTML = items.map(item => `
      <div class="product-card">
        <div class="product-card__image-wrap">
          <img class="product-card__image" src="${item.image}" alt="${item.name}"
               onerror="this.src='https://placehold.co/400x300/241811/c99a5b?text=${encodeURIComponent(item.name)}'">
        </div>
        <h3 class="product-card__name">${item.name}</h3>
        <p class="product-card__desc">${item.description || ""}</p>
        <div class="product-card__price">${CAFE_SETTINGS.currencySymbol}${item.price}</div>
        <button class="product-card__add-btn" id="add-btn-${item.id}" data-id="${item.id}">
          🛒 Add to Cart
        </button>
      </div>
    `).join("");
  },

  /* Small helper: briefly flashes a button to confirm the add */
  flashAdded(productId) {
    const btn = document.getElementById(`add-btn-${productId}`);
    if (!btn) return;
    const original = btn.innerHTML;
    btn.classList.add("is-added");
    btn.innerHTML = "✓ Added";
    setTimeout(() => {
      btn.classList.remove("is-added");
      btn.innerHTML = original;
    }, 700);
  },

  /* ---------- Cart Panel ---------- */
  renderCartPanel() {
    const count = CartManager.getTotalItemCount();
    const subtotal = CartManager.getSubtotal();
    const delivery = CartManager.getDeliveryCharge();
    const tax = CartManager.getTax();
    const total = CartManager.getGrandTotal();
    const currency = CAFE_SETTINGS.currencySymbol;

    document.getElementById("navbar-cart-count").textContent = count;

    const root = document.getElementById("cart-root");
    root.innerHTML = `
      <h2 class="cart-panel__title">🛒 Your Order</h2>
      <div class="cart-panel__count-line">Cart Items: <span>${count}</span></div>
      <hr>

      ${count === 0 ? `
        <div class="cart-empty">
          <div class="cart-empty__icon">☕</div>
          <p>Your cart is empty.<br>Add items from the menu.</p>
        </div>
      ` : `
        <div class="cart-items">
          ${Object.entries(AppState.cart).map(([id, qty]) => {
            const product = MENU_ITEMS.find(item => item.id == id);
            if (!product) return "";
            return `
              <div class="cart-line">
                <span><span class="cart-line__qty">${qty}x</span>${product.name}</span>
                <span style="display:flex; align-items:center; gap:8px;">
                  ${currency}${product.price * qty}
                  <button class="cart-line__remove" data-remove-id="${product.id}" title="Remove item">✕</button>
                </span>
              </div>`;
          }).join("")}
        </div>
      `}

      <hr>
      <div class="cart-summary-line"><span>Subtotal</span><span>${currency}${subtotal}</span></div>
      <div class="cart-summary-line"><span>Delivery</span><span>${delivery === 0 ? "Free" : currency + delivery}</span></div>
      <div class="cart-summary-line"><span>Tax (${CAFE_SETTINGS.taxPercent}%)</span><span>${currency}${tax}</span></div>
      <div class="cart-total-line">Total <span>${currency}${total}</span></div>

      <input type="text" id="customer-name" placeholder="Enter Your Name">
      <input type="text" id="customer-address" placeholder="Enter Your Address">

      <button class="btn-primary" id="place-order-btn" ${count === 0 ? "disabled" : ""}>
        📱 Place Order
      </button>
      <button class="btn-secondary" id="remove-last-btn">
        🗑️ Remove Last Item
      </button>

      <div class="cart-note">
        📋 <span>You will be redirected to WhatsApp with your order details.</span>
      </div>
    `;

    // Re-bind events for elements that were just re-created
    document.getElementById("place-order-btn").addEventListener("click", OrderManager.placeOrder);
    document.getElementById("remove-last-btn").addEventListener("click", () => CartManager.removeLast());
    root.querySelectorAll("[data-remove-id]").forEach(btn => {
      btn.addEventListener("click", () => CartManager.removeProduct(Number(btn.dataset.removeId)));
    });
  },

  /* ---------- Footer ---------- */
  renderFooter() {
    const root = document.getElementById("footer-root");
    const socials = CAFE_SETTINGS.socialLinks;
    root.innerHTML = `
      <div class="footer__brand">
        <img src="${CAFE_SETTINGS.logo}" alt="logo">
        <div>
          <strong>${CAFE_SETTINGS.cafeName.toUpperCase()}</strong><br>
          ${CAFE_SETTINGS.tagline}
        </div>
      </div>
      <div>© ${CAFE_SETTINGS.copyrightYear} ${CAFE_SETTINGS.cafeName}. All Rights Reserved. <span class="footer__heart">♥</span></div>
      <div class="footer__socials">
        ${socials.facebook !== "#" || socials.facebook ? `<a href="${socials.facebook}" aria-label="Facebook">f</a>` : ""}
        ${socials.instagram !== "#" || socials.instagram ? `<a href="${socials.instagram}" aria-label="Instagram">📷</a>` : ""}
        ${socials.whatsapp !== "#" || socials.whatsapp ? `<a href="${socials.whatsapp}" aria-label="WhatsApp">📞</a>` : ""}
      </div>
    `;
  },

  renderAll() {
    this.renderNavbar();
    this.renderHero();
    this.renderToolbar();
    this.renderProducts();
    this.renderCartPanel();
    this.renderFooter();
  },
};


/* ============================================================
   4. SEARCH & FILTER LOGIC
   ============================================================ */
const SearchFilter = {
  getVisibleItems() {
    const query = AppState.searchQuery.trim().toLowerCase();
    return MENU_ITEMS.filter(item => {
      if (item.available === false) return false;

      const matchesCategory =
        AppState.activeCategory === "all" || item.category === AppState.activeCategory;

      const matchesSearch =
        query === "" ||
        item.name.toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  },
};


/* ============================================================
   5. ORDER MANAGER
   ------------------------------------------------------------
   Builds a formatted order summary and hands it to WhatsApp.
   This is the natural place to later also save the order to
   Firebase / an orders API for order tracking and an admin
   dashboard to consume.
   ============================================================ */
const OrderManager = {
  placeOrder() {
    const name = document.getElementById("customer-name").value.trim();
    const address = document.getElementById("customer-address").value.trim();
    const currency = CAFE_SETTINGS.currencySymbol;

    if (CartManager.getTotalItemCount() === 0) {
      alert("Your cart is empty. Please add items from the menu.");
      return;
    }
    if (!name || !address) {
      alert("Please enter your name and address before placing the order.");
      return;
    }

    const orderLines = Object.entries(AppState.cart).map(([id, qty]) => {
      const product = MENU_ITEMS.find(item => item.id == id);
      return `${qty}x ${product.name} - ${currency}${product.price * qty}`;
    });

    const messageParts = [
      `*New Order - ${CAFE_SETTINGS.cafeName}*`,
      "",
      `*Name:* ${name}`,
      `*Address:* ${address}`,
      "",
      "*Order Details:*",
      ...orderLines,
      "",
      `Subtotal: ${currency}${CartManager.getSubtotal()}`,
      `Delivery: ${currency}${CartManager.getDeliveryCharge()}`,
      `Tax: ${currency}${CartManager.getTax()}`,
      `*Total: ${currency}${CartManager.getGrandTotal()}*`,
    ];

    const encodedMessage = encodeURIComponent(messageParts.join("\n"));
    const whatsappUrl = `https://wa.me/${CAFE_SETTINGS.whatsappNumber}?text=${encodedMessage}`;

    // EXTENSION POINT: this is where you'd also POST the order
    // to your own backend/Firebase before (or instead of) opening
    // WhatsApp, so it can appear in an admin dashboard / order
    // tracking view.

    window.open(whatsappUrl, "_blank");
  },
};


/* ============================================================
   6. EVENT WIRING & INIT
   ============================================================ */
function bindStaticEvents() {
  // Mobile nav toggle
  document.getElementById("navbar-toggle").addEventListener("click", () => {
    document.getElementById("navbar-links").classList.toggle("is-open");
  });

  // Nav link active state
  document.querySelectorAll(".navbar__link").forEach(link => {
    link.addEventListener("click", function () {
      document.querySelectorAll(".navbar__link").forEach(l => l.classList.remove("is-active"));
      this.classList.add("is-active");
      document.getElementById("navbar-links").classList.remove("is-open");
    });
  });

  // Header cart button scrolls to the cart panel
  document.getElementById("navbar-cart-btn").addEventListener("click", () => {
    document.getElementById("cart-root").scrollIntoView({ behavior: "smooth" });
  });

  // Category filter buttons (event delegation)
  document.getElementById("filter-bar").addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    AppState.activeCategory = btn.dataset.category;
    Renderer.renderToolbar();
    Renderer.renderProducts();
    bindProductGridEvents();
    bindFilterBarEvent(); // filter bar was re-rendered, rebind
  });

  // Search input
  document.getElementById("menu-search-input").addEventListener("input", (e) => {
    AppState.searchQuery = e.target.value;
    Renderer.renderProducts();
    bindProductGridEvents();
  });
}

// Filter bar gets replaced on every render, so its click listener
// needs to be reattached each time. Kept as its own function to
// avoid duplicating the delegation logic above.
function bindFilterBarEvent() {
  const filterBar = document.getElementById("filter-bar");
  filterBar.onclick = (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    AppState.activeCategory = btn.dataset.category;
    Renderer.renderToolbar();
    Renderer.renderProducts();
    bindProductGridEvents();
    bindFilterBarEvent();
  };
}

// Add-to-cart buttons are re-created every time the product grid
// re-renders (search/filter), so we (re)bind them after each render.
function bindProductGridEvents() {
  document.querySelectorAll(".product-card__add-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      CartManager.add(id);
      Renderer.flashAdded(id);
    };
  });
}

function initApp() {
  Renderer.renderAll();
  bindStaticEvents();
  bindFilterBarEvent();
  bindProductGridEvents();

  // EXTENSION POINT: check login/session state here and, if you
  // add authentication later, swap the "Enter Your Name/Address"
  // inputs for the logged-in user's saved details automatically.
}

document.addEventListener("DOMContentLoaded", initApp);
