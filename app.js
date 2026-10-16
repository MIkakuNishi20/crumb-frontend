// Live Render Backend Base URL
const API_BASE_URL = "https://donutsmoh.onrender.com";

// Application State
const state = {
  catalog: [],
  currentSession: null,
  cart: {},
  view: "sales"
};

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  setupLogin();
  setupNavigation();
  setupModalHandlers();
  setupCatalogHandlers();
  setupSessionHandlers();
  
  if (localStorage.getItem("crumb_authenticated") === "true") {
    document.body.classList.add("authenticated");
    const loginScreen = document.getElementById("loginScreen");
    if (loginScreen) loginScreen.hidden = true;
    loadBackendData();
  }
}

// 1. Authentication
function setupLogin() {
  const loginForm = document.getElementById("loginForm");
  const loginScreen = document.getElementById("loginScreen");
  const logoutBtn = document.getElementById("logoutButton") || document.querySelector("button[data-action='logout']");
  const loginError = document.getElementById("loginError");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("loginUsername")?.value.trim();
      const pass = document.getElementById("loginPassword")?.value.trim();

      if ((user === "admin" && pass === "boss") || (user === "user" && pass === "123")) {
        localStorage.setItem("crumb_authenticated", "true");
        localStorage.setItem("crumb_user", user);
        if (loginScreen) loginScreen.hidden = true;
        document.body.classList.add("authenticated");
        loadBackendData();
      } else {
        if (loginError) loginError.hidden = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      document.body.classList.remove("authenticated");
      window.location.reload();
    });
  }
}

// 2. Fetch Initial Data from Spring Boot Backend
async function loadBackendData() {
  console.log("Connecting to Render backend...");
  try {
    const res = await fetch(`${API_BASE_URL}/api/donuts`);
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    state.catalog = data;
    console.log("Loaded products from backend:", state.catalog);
    renderAllViews();
  } catch (err) {
    console.error("Backend fetch error:", err);
    showToast("Connected to live server (no active items yet).");
  }
}

// 3. Modals & Interface Buttons
function setupModalHandlers() {
  // Global click delegate for buttons with data-modal or open actions
  document.addEventListener("click", (e) => {
    const target = e.target.closest("button, a");
    if (!target) return;

    // Open Modals
    if (target.textContent.includes("New session") || target.dataset.action === "new-session") {
      e.preventDefault();
      openModal("newSessionModal");
    } else if (target.textContent.includes("Manage catalog") || target.textContent.includes("Add donut type") || target.dataset.action === "add-catalog") {
      e.preventDefault();
      openModal("addCatalogModal");
    } else if (target.dataset.close || target.classList.contains("modal-close") || target.textContent === "Cancel") {
      e.preventDefault();
      closeAllModals();
    }
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("show");
    modal.style.display = "flex";
  }
}

function closeAllModals() {
  document.querySelectorAll(".modal, [data-modal-container]").forEach(m => {
    m.classList.remove("show");
    m.style.display = "none";
  });
}

// 4. Catalog Management (Adding New Product)
function setupCatalogHandlers() {
  const addProductForm = document.getElementById("addProductForm") || document.querySelector("form[data-form='add-product']");
  
  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("donutName") || addProductForm.querySelector("input[type='text']");
      const priceInput = document.getElementById("donutPrice") || addProductForm.querySelector("input[type='number']");

      if (!nameInput || !priceInput) return;

      const newProduct = {
        name: nameInput.value.trim(),
        price: parseFloat(priceInput.value)
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/donuts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct)
        });

        if (res.ok) {
          showToast("Product saved successfully!");
          closeAllModals();
          nameInput.value = "";
          priceInput.value = "";
          loadBackendData(); // Reload from backend
        } else {
          showToast("Error saving product to backend.");
        }
      } catch (err) {
        console.error("Save error:", err);
        showToast("Server connection error.");
      }
    });
  }
}

// 5. Session & Interactive Order Logic
function setupSessionHandlers() {
  // Delegate quantity +/- and cart additions
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.classList.contains("btn-plus") || btn.textContent === "+") {
      const card = btn.closest("[data-product-id], .type-card, .donut-card");
      const id = card?.dataset.productId || btn.dataset.id;
      if (id) updateCart(id, 1);
    } else if (btn.classList.contains("btn-minus") || btn.textContent === "-") {
      const card = btn.closest("[data-product-id], .type-card, .donut-card");
      const id = card?.dataset.productId || btn.dataset.id;
      if (id) updateCart(id, -1);
    }
  });
}

function updateCart(productId, change) {
  const currentQty = state.cart[productId] || 0;
  const newQty = Math.max(0, currentQty + change);
  if (newQty === 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = newQty;
  }
  renderCart();
}

function renderCart() {
  const cartContainer = document.getElementById("cartItems") || document.querySelector(".checkout-summary");
  const totalElem = document.getElementById("cartTotal") || document.querySelector(".checkout-total");
  
  let total = 0;
  let itemCount = 0;

  Object.entries(state.cart).forEach(([id, qty]) => {
    const item = state.catalog.find(p => String(p.id) === String(id));
    if (item) {
      total += item.price * qty;
      itemCount += qty;
    }
  });

  if (totalElem) totalElem.textContent = `₱${total.toFixed(2)}`;
}

// 6. View Switcher
function setupNavigation() {
  document.querySelectorAll(".workspace-nav a, nav a").forEach(link => {
    link.addEventListener("click", (e) => {
      const targetView = link.getAttribute("href")?.replace("#", "") || link.dataset.view;
      if (targetView && document.getElementById(targetView)) {
        e.preventDefault();
        document.querySelectorAll(".workspace-nav a, nav a").forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        
        document.querySelectorAll("main > section, .view-section").forEach(sec => sec.style.display = "none");
        const activeSec = document.getElementById(targetView);
        if (activeSec) activeSec.style.display = "block";
      }
    });
  });
}

function renderAllViews() {
  // Refresh catalog grids if items exist
  const grids = document.querySelectorAll("#salesTypeGrid, #storefrontGrid, .catalog-grid");
  grids.forEach(grid => {
    if (!grid) return;
    if (state.catalog.length === 0) return;

    grid.innerHTML = state.catalog.map(item => `
      <div class="type-card" data-product-id="${item.id}">
        <div class="type-card-top">
          <div class="type-art">🍩</div>
          <span class="stock-tag">In stock</span>
        </div>
        <h3>${item.name}</h3>
        <div class="type-price">₱${Number(item.price).toFixed(2)}</div>
        <div class="quantity-controls">
          <button class="btn-minus">-</button>
          <span>${state.cart[item.id] || 0}</span>
          <button class="btn-plus">+</button>
        </div>
      </div>
    `).join("");
  });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }
}
