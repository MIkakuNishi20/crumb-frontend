// Live Render Backend URL
const API_BASE_URL = "https://donutsmoh.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  
  if (localStorage.getItem("crumb_authenticated") === "true") {
    document.body.classList.add("authenticated");
    initializeDashboard();
  }
});

// 1. Handle Login
function setupLogin() {
  const loginForm = document.getElementById("loginForm");
  const loginScreen = document.getElementById("loginScreen");
  const logoutButton = document.getElementById("logoutButton");
  const loginError = document.getElementById("loginError");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("loginUsername").value.trim();
      const pass = document.getElementById("loginPassword").value.trim();

      if ((user === "admin" && pass === "boss") || (user === "user" && pass === "123")) {
        localStorage.setItem("crumb_authenticated", "true");
        localStorage.setItem("crumb_user", user);
        if (loginScreen) loginScreen.hidden = true;
        document.body.classList.add("authenticated");
        initializeDashboard();
      } else {
        if (loginError) loginError.hidden = false;
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("crumb_authenticated");
      localStorage.removeItem("crumb_user");
      document.body.classList.remove("authenticated");
      window.location.reload();
    });
  }
}

// 2. Initialize Dashboard
async function initializeDashboard() {
  console.log("Dashboard initialized. Connecting to backend...");
  await fetchDonutsFromBackend();
  setupNavigation();
}

// 3. Fetch Donuts from Spring Boot Backend
async function fetchDonutsFromBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/donuts`);
    if (!response.ok) {
      throw new Error("Failed to fetch donuts from backend server.");
    }
    
    const donuts = await response.json();
    console.log("Loaded donuts from Render database:", donuts);
    renderCatalog(donuts);
  } catch (error) {
    console.error("Backend connection error:", error);
    showToast("Could not connect to live backend.");
  }
}

// 4. Render Catalog Items to UI
function renderCatalog(donuts) {
  const salesGrid = document.getElementById("salesTypeGrid");
  const storefrontGrid = document.getElementById("storefrontGrid");
  const salesEmpty = document.getElementById("salesEmpty");

  if (!donuts || donuts.length === 0) {
    if (salesEmpty) salesEmpty.classList.add("show");
    return;
  }

  if (salesEmpty) salesEmpty.classList.remove("show");

  let htmlContent = "";
  donuts.forEach(donut => {
    htmlContent += `
      <article class="type-card">
        <div class="type-card-top">
          <div class="type-art">🍩</div>
          <span class="stock-tag">Stock: ${donut.stock ?? 0}</span>
        </div>
        <h3>${donut.name}</h3>
        <div class="type-price">₱${Number(donut.price).toFixed(2)}</div>
      </article>
    `;
  });

  if (salesGrid) salesGrid.innerHTML = htmlContent;
  if (storefrontGrid) storefrontGrid.innerHTML = htmlContent;
}

// 5. Simple Navigation Switcher for Sidebar Tabs
function setupNavigation() {
  const navLinks = document.querySelectorAll(".workspace-nav a, .sidebar nav a");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      // Handle tab switching if multiple views exist in HTML
    });
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}
