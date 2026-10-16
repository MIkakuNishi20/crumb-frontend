// Live Render Backend URL
const API_BASE_URL = "https://donutsmoh.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  
  // If already authenticated in this session, load data
  if (localStorage.getItem("crumb_authenticated") === "true") {
    document.body.classList.add("authenticated");
    initializeDashboard();
  }
});

// 1. Handle Login Screen
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

      // Demo credentials check matching the prototype guidelines
      if ((user === "admin" && pass === "boss") || (user === "user" && pass === "123")) {
        localStorage.setItem("crumb_authenticated", "true");
        localStorage.setItem("crumb_user", user);
        loginScreen.hidden = true;
        document.body.classList.add("authenticated");
        initializeDashboard();
      } else {
        loginError.hidden = false;
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

// 2. Initialize Dashboard & Fetch Data from Backend
async function initializeDashboard() {
  console.log("Dashboard initialized. Connecting to backend...");
  await fetchDonutsFromBackend();
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
    
    // Render products into the UI grids
    renderCatalog(donuts);
  } catch (error) {
    console.error("Backend connection error:", error);
    showToast("Could not connect to live backend.");
  }
}

// 4. Render Catalog Items to the UI Grid
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

// Simple Toast Notification Helper
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
