// ===============================
// PRODUCT DATA (prices in USD)
// ===============================
const products = {
  // Ranks
  vip: {
    id: "vip",
    name: "VIP Rank",
    price: 6.99,
    category: "ranks",
    description: "Perfect starter rank for casual players.",
  },
  mvp: {
    id: "mvp",
    name: "MVP Rank",
    price: 12.99,
    category: "ranks",
    description: "All VIP perks plus lobby cosmetics.",
  },
  legend: {
    id: "legend",
    name: "Legend Rank",
    price: 24.99,
    category: "ranks",
    description: "Ultimate flex for grinders & creators.",
  },

  // Crates
  "crate-basic": {
    id: "crate-basic",
    name: "Basic Crate x3",
    price: 3.49,
    category: "crates",
    description: "Starter bundle to test your luck.",
  },
  "crate-rare": {
    id: "crate-rare",
    name: "Rare Crate x5",
    price: 9.99,
    category: "crates",
    description: "Higher chances, better rewards.",
  },
  "crate-omega": {
    id: "crate-omega",
    name: "Omega Crate x10",
    price: 18.99,
    category: "crates",
    description: "Max out your spins for god-tier loot.",
  },

  // Cosmetics
  "cos-wings": {
    id: "cos-wings",
    name: "Emerald Wings",
    price: 4.99,
    category: "cosmetics",
    description: "Floating green wings on your back.",
  },
  "cos-halo": {
    id: "cos-halo",
    name: "Halo Aura",
    price: 3.99,
    category: "cosmetics",
    description: "Clean glowing halo above your head.",
  },
  "cos-trail": {
    id: "cos-trail",
    name: "Pixel Trail",
    price: 2.99,
    category: "cosmetics",
    description: "Footstep particles everywhere you walk.",
  },
};

// Recent purchases dummy data
const recentPurchasesData = [
  { name: "Steve", package: "VIP Rank", ago: "2 min ago" },
  { name: "Alex", package: "Rare Crate x5", ago: "5 min ago" },
  { name: "PixelFox", package: "Emerald Wings", ago: "9 min ago" },
  { name: "BlockChamp", package: "Legend Rank", ago: "15 min ago" },
];

// ===============================
// CURRENCY CONFIG
// ===============================
const currencyConfig = {
  USD: { symbol: "$", rate: 1 },
  INR: { symbol: "₹", rate: 83 }, // approx
  EUR: { symbol: "€", rate: 0.92 }, // approx
};

let currentCurrency = "USD";

function formatPrice(amountUSD) {
  const cfg = currencyConfig[currentCurrency] || currencyConfig.USD;
  const converted = amountUSD * cfg.rate;
  const decimals = 2;
  return `${cfg.symbol}${converted.toFixed(decimals)}`;
}

// ===============================
// DOM ELEMENTS
// ===============================
const packagesGrid = document.getElementById("packages-grid");
const categoryTabs = document.querySelectorAll(".tab");
const cartButton = document.getElementById("cart-button");
const cartOverlay = document.getElementById("cart-overlay");
const cartDrawer = document.getElementById("cart-drawer");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const checkoutBtn = document.getElementById("checkout-btn");
const copyIp = document.getElementById("copy-ip");
const copyIpHero = document.getElementById("copy-ip-hero");
const playerCount = document.getElementById("player-count");
const recentPurchasesList = document.getElementById("recent-purchases");
const yearSpan = document.getElementById("year");
const navToggle = document.getElementById("nav-toggle");
const mobileNav = document.getElementById("mobile-nav");
const browsePackagesBtn = document.getElementById("browse-packages-btn");
const currencyToggle = document.getElementById("currency-toggle");
const currencyMenu = document.getElementById("currency-menu");
const currencyLabel = document.getElementById("currency-label");

// ===============================
// CART STATE
// ===============================
const cart = {}; // { productId: { id, name, price, qty } }

// ===============================
// RENDER FUNCTIONS
// ===============================

function createPackageCardsForCategory(category) {
  const cards = [];

  Object.values(products).forEach((p) => {
    if (p.category !== category) return;

    const card = document.createElement("article");
    card.className = "package-card";

    card.innerHTML = `
      <div class="package-header">
        <h3>${p.name}</h3>
        <p class="package-desc">${p.description}</p>
      </div>
      <div class="package-price-row">
        <div class="package-price">
          ${formatPrice(p.price)} <span>${currentCurrency}</span>
        </div>
      </div>
      <div class="package-actions">
        <button class="primary-btn add-package-btn" data-product-id="${p.id}">
          Add to cart
        </button>
      </div>
    `;

    cards.push(card);
  });

  return cards;
}

function renderProducts(category) {
  if (!packagesGrid) return;

  packagesGrid.innerHTML = "";
  const cards = createPackageCardsForCategory(category);
  cards.forEach((card) => packagesGrid.appendChild(card));

  // Attach click handlers
  const buttons = packagesGrid.querySelectorAll(".add-package-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-product-id");
      addToCart(id);
    });
  });
}

function setupCategoryTabs() {
  if (!categoryTabs || categoryTabs.length === 0) return;

  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      categoryTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const category = tab.getAttribute("data-category");
      renderProducts(category);
    });
  });
}

// ===============================
// CART LOGIC
// ===============================

function addToCart(productId) {
  const product = products[productId];
  if (!product) return;

  if (!cart[productId]) {
    cart[productId] = {
      id: product.id,
      name: product.name,
      price: product.price, // stored in USD
      qty: 1,
    };
  } else {
    cart[productId].qty += 1;
  }

  updateCartUI();
  openCart();
}

function removeFromCart(productId) {
  if (!cart[productId]) return;
  delete cart[productId];
  updateCartUI();
}

function changeCartQty(productId, delta) {
  if (!cart[productId]) return;
  cart[productId].qty += delta;
  if (cart[productId].qty <= 0) {
    delete cart[productId];
  }
  updateCartUI();
}

function updateCartUI() {
  if (!cartItemsContainer || !cartTotal || !cartCount) return;

  cartItemsContainer.innerHTML = "";
  let total = 0;
  let itemCount = 0;

  Object.values(cart).forEach((item) => {
    total += item.price * item.qty;
    itemCount += item.qty;

    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <div class="cart-item-main">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-meta">
          Qty: ${item.qty} · ${formatPrice(item.price)} ea
        </div>
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1">-</button>
        <button class="cart-qty-btn" data-id="${item.id}" data-delta="1">+</button>
        <button class="cart-remove-btn" data-id="${item.id}">✕</button>
        <div class="cart-item-price">
          ${formatPrice(item.price * item.qty)}
        </div>
      </div>
    `;

    cartItemsContainer.appendChild(row);
  });

  cartTotal.textContent = formatPrice(total);
  cartCount.textContent = itemCount;

  const cartEmpty = document.getElementById("cart-empty");
  if (cartEmpty) {
    cartEmpty.style.display = itemCount === 0 ? "block" : "none";
  }

  // attach events
  cartItemsContainer
    .querySelectorAll(".cart-qty-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const delta = parseInt(btn.getAttribute("data-delta"), 10);
        changeCartQty(id, delta);
      })
    );

  cartItemsContainer
    .querySelectorAll(".cart-remove-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        removeFromCart(id);
      })
    );
}

function openCart() {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
}

function closeCart() {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

function setupCart() {
  if (cartButton) {
    cartButton.addEventListener("click", openCart);
  }
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", closeCart);
  }
  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart);
  }
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      alert(
        "This is a demo store UI. Integrate your own payment backend for real checkouts."
      );
    });
  }

  updateCartUI();
}

// ===============================
// OTHER UI HELPERS
// ===============================

function setupCopyIp() {
  const ipText = "play.coming.soon";
  function copy() {
    navigator.clipboard
      .writeText(ipText)
      .then(() => {
        alert("IP copied: " + ipText);
      })
      .catch(() => {
        alert("Could not copy IP. Copy manually: " + ipText);
      });
  }

  if (copyIp) copyIp.addEventListener("click", copy);
  if (copyIpHero) copyIpHero.addEventListener("click", copy);
}

function setupPlayers() {
  if (!playerCount) return;
  const online = 140 + Math.floor(Math.random() * 40);
  playerCount.textContent = `${online} / 500`;
}

function setupRecentPurchases() {
  if (!recentPurchasesList) return;

  recentPurchasesList.innerHTML = "";
  recentPurchasesData.forEach((p) => {
    const li = document.createElement("li");
    li.className = "recent-purchase-row";
    li.innerHTML = `
      <span class="rp-name">${p.name}</span>
      <span class="rp-package">${p.package}</span>
      <span class="rp-ago">${p.ago}</span>
    `;
    recentPurchasesList.appendChild(li);
  });
}

function setupYear() {
  if (!yearSpan) return;
  yearSpan.textContent = new Date().getFullYear();
}

function setupMobileNav() {
  if (!navToggle || !mobileNav) return;

  navToggle.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => mobileNav.classList.remove("open"));
  });
}

function setupScrollReveal() {
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || revealItems.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealItems.forEach((el) => observer.observe(el));
}

function setupFAQ() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    const icon = item.querySelector(".faq-icon");

    if (!question || !answer) return;

    question.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      answer.style.maxHeight = open ? answer.scrollHeight + "px" : "0px";
      if (icon) icon.textContent = open ? "−" : "+";
    });

    answer.style.maxHeight = "0px";
  });
}

function setupRankBuyButtons() {
  const buttons = document.querySelectorAll(".rank-buy-btn, .crate-buy-btn, .cos-buy-btn, .rank-buy-btn2");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-rank-id");
      if (!id) return;
      addToCart(id);
    });
  });
}

function setupPageEffects() {
  if (browsePackagesBtn) {
    browsePackagesBtn.addEventListener("click", () => {
      const el = document.getElementById("packages");
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Active nav link based on scroll (simple)
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-right .nav-link");

  window.addEventListener("scroll", () => {
    let currentId = null;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 80 && rect.bottom >= 80) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        const id = href.slice(1);
        if (id === currentId) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      }
    });
  });
}

function setupCurrencySwitcher() {
  if (!currencyToggle || !currencyMenu || !currencyLabel) return;

  // open / close
  currencyToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    currencyMenu.classList.toggle("open");
  });

  // select currency
  currencyMenu.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cur = btn.getAttribute("data-currency");
      if (!currencyConfig[cur]) return;

      currentCurrency = cur;
      currencyLabel.textContent = cur;

      // re-render packages (on index only)
      if (packagesGrid) {
        const activeTab = document.querySelector(".tab.active");
        const category = activeTab
          ? activeTab.getAttribute("data-category")
          : "ranks";
        renderProducts(category);
      }

      // update cart
      updateCartUI();

      currencyMenu.classList.remove("open");
    });
  });

  // click outside -> close
  document.addEventListener("click", (e) => {
    if (
      !currencyToggle.contains(e.target) &&
      !currencyMenu.contains(e.target)
    ) {
      currencyMenu.classList.remove("open");
    }
  });
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Only render products / tabs on main page
  if (packagesGrid) {
    renderProducts("ranks");
    setupCategoryTabs();
  }

  setupCart();
  setupFAQ();
  setupCopyIp();
  setupPlayers();
  setupRecentPurchases();
  setupYear();
  setupMobileNav();
  setupScrollReveal();
  setupRankBuyButtons();
  setupPageEffects();
  setupCurrencySwitcher();
});
// === Fake live player count animation ===
(function () {
  const el = document.getElementById("player-count-value");
  if (!el) return;

  let base = 1200;    // min players
  let max = 2200;     // max players

  function randomStep() {
    // -25 se +40 tak random change
    const delta = Math.floor(Math.random() * 65) - 25;
    base = Math.min(max, Math.max(800, base + delta));
    el.textContent = base.toLocaleString("en-US");
  }

  randomStep();
  setInterval(randomStep, 3500);
})();
// ===============================1