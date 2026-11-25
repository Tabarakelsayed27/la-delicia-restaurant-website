// Shared navigation and active page
const mobileToggle = document.querySelector(".mobile-toggle");
const navLinks = document.querySelector(".nav-links");
if (mobileToggle && navLinks) mobileToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(link => {
  const current = document.body.dataset.page;
  if (link.dataset.page === current) link.classList.add("active");
});

// Login and sign-up demo: stores a local demo profile in this browser.
const authForm = document.getElementById("authForm");
if (authForm) {
  let mode = "login";
  const tabs = document.querySelectorAll("[data-auth]");
  const nameField = document.querySelector(".auth-name");
  const title = document.getElementById("authTitle");
  const desc = document.getElementById("authDesc");
  const buttonText = document.getElementById("authButtonText");
  tabs.forEach(tab => tab.addEventListener("click", () => {
    mode = tab.dataset.auth;
    tabs.forEach(t => t.classList.toggle("active", t === tab));
    nameField.classList.toggle("hidden-field", mode === "login");
    nameField.querySelector("input").required = mode === "signup";
    title.textContent = mode === "login" ? "Welcome Back" : "Create Your Account";
    desc.textContent = mode === "login" ? "Sign in to discover a world of exceptional flavours." : "Join us and make every dining moment special.";
    buttonText.textContent = mode === "login" ? "Sign In" : "Create Account";
    document.getElementById("authFeedback").textContent = "";
  }));
  authForm.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(authForm);
    const profile = {name: data.get("name") || "La Delicia Guest", email: data.get("email")};
    localStorage.setItem("laDeliciaProfile", JSON.stringify(profile));
    document.getElementById("authFeedback").textContent = "You're all set! Taking you to La Delicia...";
    setTimeout(() => location.href = "home.html", 650);
  });
}

// Menu filtering, search and favourites
const filterButtons = document.querySelectorAll(".filter-btn");
const products = document.querySelectorAll(".menu-product");
function applyMenuFilters() {
  const active = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
  const query = (document.getElementById("menuSearch")?.value || "").toLowerCase();
  products.forEach(card => {
    const matchesCategory = active === "all" || card.dataset.category === active;
    const matchesSearch = card.textContent.toLowerCase().includes(query);
    card.classList.toggle("hidden", !(matchesCategory && matchesSearch));
  });
}
filterButtons.forEach(btn => btn.addEventListener("click", () => {
  filterButtons.forEach(item => item.classList.toggle("active", item === btn));
  applyMenuFilters();
}));
document.getElementById("menuSearch")?.addEventListener("input", applyMenuFilters);
document.querySelectorAll(".heart-btn").forEach(btn => btn.addEventListener("click", () => {
  btn.classList.toggle("liked");
  btn.textContent = btn.classList.contains("liked") ? "♥" : "♡";
}));

// Cart stored locally so items remain when moving between pages.
function getCart() { return JSON.parse(localStorage.getItem("laDeliciaCart") || "[]"); }
function saveCart(cart) { localStorage.setItem("laDeliciaCart", JSON.stringify(cart)); updateCartCount(); }
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("#cartCount").forEach(el => el.textContent = count);
}
document.querySelectorAll(".add-cart").forEach(btn => btn.addEventListener("click", () => {
  const cart = getCart();
  const existing = cart.find(item => item.name === btn.dataset.name);
  if (existing) existing.qty += 1;
  else cart.push({name: btn.dataset.name, price: Number(btn.dataset.price), qty: 1});
  saveCart(cart);
  const old = btn.textContent;
  btn.textContent = "Added ✓";
  setTimeout(() => btn.textContent = old, 900);
}));
// Build the cart items, quantities, and total on the cart page.
function renderCart() {
  const holder = document.getElementById("cartItems");
  if (!holder) return;
  const cart = getCart();
  if (!cart.length) {
    holder.innerHTML = '<div class="empty-cart"><h2>Your cart is waiting</h2><p>Discover something delicious from our menu.</p><a href="menu.html">Explore the menu →</a></div>';
  } else {
    holder.innerHTML = cart.map((item, index) => `
      <article class="cart-row">
        <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=250&q=80" alt="">
        <div><h3>${item.name}</h3><p>$${item.price} each</p>
          <div class="quantity-controls"><button data-cart-action="minus" data-index="${index}">−</button><b>${item.qty}</b><button data-cart-action="plus" data-index="${index}">+</button></div>
          <button class="remove-item" data-cart-action="remove" data-index="${index}">Remove</button>
        </div><strong>$${(item.price * item.qty).toFixed(2)}</strong>
      </article>`).join("");
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("cartSubtotal").textContent = "$" + total.toFixed(2);
  document.getElementById("cartTotal").textContent = "$" + total.toFixed(2);
}
// Handle quantity changes and item removal in the cart.
document.getElementById("cartItems")?.addEventListener("click", e => {
  const btn = e.target.closest("[data-cart-action]");
  if (!btn) return;
  const cart = getCart(), index = Number(btn.dataset.index), action = btn.dataset.cartAction;
  if (action === "plus") cart[index].qty++;
  if (action === "minus") cart[index].qty = Math.max(1, cart[index].qty - 1);
  if (action === "remove") cart.splice(index, 1);
  saveCart(cart); renderCart();
});
document.getElementById("checkoutBtn")?.addEventListener("click", () => location.href = "reservation.html");
updateCartCount(); renderCart();

// Reservation request opens WhatsApp with the entered details.
// Set the earliest selectable reservation date.
const bookingDate = document.getElementById("bookingDate");
if (bookingDate) {
  const now = new Date();
  bookingDate.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];
}
document.getElementById("reservationForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const details = ["Hello La Delicia, I would like to request a reservation.",
    `Name: ${data.get("name")}`, `Phone: ${data.get("phone")}`, `Date: ${data.get("date")}`,
    `Time: ${data.get("time")}`, `Guests: ${data.get("guests")}`, `Request: ${data.get("request") || "None"}`].join("\\n");
  document.getElementById("reservationFeedback").textContent = "Opening WhatsApp with your reservation request...";
  window.open("https://wa.me/201234567890?text=" + encodeURIComponent(details), "_blank");
});

// Contact form opens an email draft; connect a backend/email service for real delivery.
document.getElementById("contactForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const subject = data.get("subject") || "Website enquiry";
  const body = `Name: ${data.get("name")}\\nEmail: ${data.get("email")}\\n\\n${data.get("message")}`;
  document.getElementById("contactFeedback").textContent = "Opening your email app...";
  location.href = `mailto:hello@ladelicia.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// Profile details and sign out
const profile = JSON.parse(localStorage.getItem("laDeliciaProfile") || "null");
if (document.getElementById("profileName")) {
  document.getElementById("profileName").textContent = profile ? `Welcome, ${profile.name}` : "Welcome, Guest";
  document.getElementById("profileEmail").textContent = profile ? profile.email : "Sign in to personalise your experience.";
}
// Sign out and return to the login page.
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("laDeliciaProfile");
  location.href = "index.html";
});


// Subtle reveal-on-scroll animation for page sections and content cards.
const revealTargets = document.querySelectorAll('main section, .menu-product, .dish-card, .gallery-grid figure, .values-grid > div, .about-story > img');
revealTargets.forEach((element, index) => {
  element.classList.add('reveal-on-scroll');
  element.style.transitionDelay = `${(index % 4) * 70}ms`;
});
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(element => revealObserver.observe(element));
} else {
  revealTargets.forEach(element => element.classList.add('is-visible'));
}
