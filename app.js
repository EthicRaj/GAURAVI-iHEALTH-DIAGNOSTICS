// app.js – BloodLab booking page (HTML ke hisaab se tailor kiya hua)

// Import API configuration from shared config
// This will auto-detect localhost vs IP-based access
function getBackendURL() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // If running on localhost, use port 5000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//localhost:5000/api`;
    }

    // If running on network IP (for mobile access)
    // Use same host but port 5000
    return `${protocol}//${hostname}:5000/api`;
}

// Ensure a single API_CONFIG instance (compatible with `api-config.js`)
if (typeof API_CONFIG === 'undefined') {
  var API_CONFIG = {
    BASE_URL: getBackendURL(),
    ENDPOINTS: {
      TESTS: '/tests',
      BOOKINGS: '/bookings',
      USERS: '/users'
    }
  };
} else {
  // Normalize endpoint names if `api-config.js` provided lower-case keys
  API_CONFIG.ENDPOINTS = API_CONFIG.ENDPOINTS || {};
  API_CONFIG.ENDPOINTS.TESTS = API_CONFIG.ENDPOINTS.TESTS || API_CONFIG.ENDPOINTS.tests || '/tests';
  API_CONFIG.ENDPOINTS.BOOKINGS = API_CONFIG.ENDPOINTS.BOOKINGS || API_CONFIG.ENDPOINTS.bookings || '/bookings';
  API_CONFIG.ENDPOINTS.USERS = API_CONFIG.ENDPOINTS.USERS || API_CONFIG.ENDPOINTS.users || '/users';
  // Ensure BASE_URL exists
  API_CONFIG.BASE_URL = API_CONFIG.BASE_URL || getBackendURL();
}

// Simple APIClient for app.js
class AppAPIClient {
  static async request(method, endpoint, data = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (data) options.body = JSON.stringify(data);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  }

  static getTests() {
    return this.request('GET', API_CONFIG.ENDPOINTS.TESTS);
  }

  static createBooking(bookingData) {
    return this.request('POST', API_CONFIG.ENDPOINTS.BOOKINGS, bookingData);
  }

  static createUser(userData) {
    return this.request('POST', API_CONFIG.ENDPOINTS.USERS, userData);
  }
}

// ---- data ----
let TESTS = []; // Will be populated from API

// ---- Auth UI State ----
let currentUser = null;

// ---- Auth UI Functions ----
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/me');
    if (response.ok) {
      const user = await response.json();
      currentUser = user;
      updateAuthUI(true);
    } else {
      currentUser = null;
      updateAuthUI(false);
    }
  } catch (error) {
    console.warn('Auth check failed:', error);
    currentUser = null;
    updateAuthUI(false);
  }
}

function updateAuthUI(isLoggedIn) {
  const authButtons = document.getElementById('authButtons');
  const profileSection = document.getElementById('profileSection');
  const profileIcon = document.getElementById('profileIcon');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');

  // Hide/show booking panel based on login status
  const bookingPanel = document.querySelector('.panel-col');
  if (bookingPanel) {
    bookingPanel.style.display = isLoggedIn ? '' : 'none';
  }

  // Hide/show floating cart based on login status
  const floatingCart = document.getElementById('floatingCart');
  if (floatingCart) {
    floatingCart.style.display = isLoggedIn ? '' : 'none';
  }

  if (isLoggedIn && currentUser) {
    if (authButtons) authButtons.classList.add('hidden');
    if (profileSection) profileSection.classList.remove('hidden');
    if (profileName) profileName.textContent = currentUser.name || 'User';
    if (profileEmail) profileEmail.textContent = currentUser.email || currentUser.phone || '';
  } else {
    if (authButtons) authButtons.classList.remove('hidden');
    if (profileSection) profileSection.classList.add('hidden');
  }
}

async function handleSignOut() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    currentUser = null;
    updateAuthUI(false);
    // Redirect to homepage
    window.location.href = '/';
  } catch (error) {
    console.warn('Logout failed:', error);
    alert('Logout failed, please try again.');
  }
}

// Profile dropdown toggle
function toggleProfileDropdown() {
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) {
    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
      dropdown.classList.remove('hidden');
    } else {
      dropdown.classList.add('hidden');
    }
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const profileSection = document.getElementById('profileSection');
  const dropdown = document.getElementById('profileDropdown');
  if (profileSection && dropdown && !profileSection.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

// Profile link handlers (placeholders)
function handleMyOrders() {
  alert('My Orders - Feature coming soon!');
}

function handleMyReports() {
  alert('My Reports - Feature coming soon!');
}

function handleEditProfile() {
  alert('Edit Profile - Feature coming soon!');
}

function handleSettings() {
  alert('Settings - Feature coming soon!');
}

// Load tests - try API first, fallback to hardcoded data
async function loadTestsFromAPI() {
  console.log('🚀 Loading tests...');
  
  // First try to load from API
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TESTS}`;
    console.log('🔗 Fetching from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const tests = await response.json();
    console.log('✅ API returned:', tests);
    
    if (Array.isArray(tests) && tests.length > 0) {
      TESTS = tests;
      console.log('✅ Loaded', TESTS.length, 'tests from API');
      return;
    }
  } catch (error) {
    console.warn('⚠️ API failed:', error.message);
  }
  
  // Fallback to hardcoded tests
  console.log('📦 Using fallback tests...');
  loadFallbackTests();
  console.log('✅ Loaded', TESTS.length, 'fallback tests');
}

// Fallback test data in case API fails
function loadFallbackTests() {
  TESTS = [
  { id: 'preg', name: 'Pregnancy Test', price: 250, desc: 'Urine hCG qualitative test', popularity: 95 },
  { id: 'fullbody', name: 'Full Body Checkups', price: 1999, desc: 'Complete health screening package', popularity: 100 },
  { id: 'covid', name: 'Covid 19 Test', price: 1200, desc: 'RT-PCR COVID detection test', popularity: 90 },
  { id: 'heart', name: 'Heart Test', price: 1400, desc: 'Lipid + ECG + Cardiac markers', popularity: 80 },
  { id: 'kidney', name: 'Kidney Test', price: 950, desc: 'Creatinine, Urea, Uric Acid', popularity: 85 },
  { id: 'liver', name: 'Liver Test', price: 1100, desc: 'SGOT, SGPT, Bilirubin', popularity: 88 },
  { id: 'cbc', name: 'CBC Test', price: 350, desc: 'Complete Blood Count', popularity: 100 },
  { id: 'chol', name: 'Cholesterol Test', price: 450, desc: 'Total cholesterol test', popularity: 75 },
  { id: 'hba1c', name: 'HbA1c Test', price: 600, desc: '3-month blood sugar analysis', popularity: 90 },
  { id: 'hepb', name: 'Hepatitis B Test', price: 750, desc: 'HBsAg blood test', popularity: 70 },

  { id: 'kft', name: 'Kidney Function Test', price: 1000, desc: 'KFT panel (Urea, Creatinine)', popularity: 85 },
  { id: 'lft', name: 'Liver Function Test', price: 1050, desc: 'Complete LFT panel', popularity: 88 },
  { id: 'sugar', name: 'Sugar Test', price: 200, desc: 'Fasting blood sugar test', popularity: 100 },
  { id: 'thyroid', name: 'Thyroid Test', price: 500, desc: 'T3, T4, TSH panel', popularity: 95 },
  { id: 'typhoid', name: 'Typhoid Test', price: 450, desc: 'Widal blood test', popularity: 70 },
  { id: 'uric', name: 'Uric Acid Test', price: 350, desc: 'Joint pain & gout analysis', popularity: 75 },
  { id: 'b12', name: 'Vitamin B12 Test', price: 750, desc: 'Vitamin deficiency test', popularity: 80 },
  { id: 'vitd', name: 'Vitamin D Test', price: 900, desc: 'Bone health vitamin test', popularity: 90 },

  { id: 'allergy', name: 'Allergy Test', price: 1600, desc: 'IgE allergy blood test', popularity: 70 },
  { id: 'arthritis', name: 'Arthritis Test', price: 1400, desc: 'RA factor and CRP', popularity: 65 },
  { id: 'cancer', name: 'Cancer Test', price: 2500, desc: 'Tumor marker screening', popularity: 60 },
  { id: 'bone', name: 'Bone And Joint', price: 1200, desc: 'Calcium, Vitamin D, X-ray (demo)', popularity: 70 },
  { id: 'dengue', name: 'Dengue Test', price: 800, desc: 'NS1, IgM, IgG panel', popularity: 95 },
  { id: 'diabetes', name: 'Diabetes Test', price: 400, desc: 'Fasting & PP sugar test', popularity: 100 },
  { id: 'rheumatoid', name: 'Rheumatoid Test', price: 1100, desc: 'RA factor blood test', popularity: 60 },
  { id: 'tb', name: 'Tuberculosis Test', price: 1600, desc: 'TB Gold / ESR test', popularity: 55 },

  { id: 'fertility', name: 'Infertility Test', price: 2800, desc: 'Hormone & fertility analysis', popularity: 60 },
  { id: 'diacare', name: 'Diabetes Care', price: 1800, desc: 'Complete diabetes monitoring pack', popularity: 85 },
  { id: 'anemia', name: 'Anemia Test', price: 450, desc: 'Iron, Ferritin, HB test', popularity: 80 },
  { id: 'gastro', name: 'GastroIntestinal', price: 1500, desc: 'Digestive system test panel', popularity: 60 },
  { id: 'autoimmune', name: 'Autoimmune Disorders', price: 3000, desc: 'ANA, ESR, CRP panel', popularity: 50 },
  { id: 'fever', name: 'Fever Test', price: 1200, desc: 'Malaria, Dengue, Typhoid combo', popularity: 95 }
  ];
}

  // Quick-book bundles for hero
  const QUICK_BUNDLES = {
    general: ['cbc', 'lipid', 'sugar'],   // General checkup
    diabetes: ['sugar'],                  // Agar aage HbA1c add karo to yahan bhi daal dena: ['sugar','hba1c']
    thyroid: ['thyroid'],
    fever: ['cbc'],                       // Fever me CBC kaam aata hai
    covid: ['covid']
  };

  const PURPOSE_LABELS = {
    general: 'general health checkup',
    diabetes: 'diabetes / sugar',
    thyroid: 'thyroid',
    fever: 'fever / viral',
    covid: 'COVID symptoms'
  };


const PROMOS = {
  WELCOME10: { type: "percent", value: 10 },
  FLAT50: { type: "flat", value: 50 }
};

const MAX_FILE_MB = 10;

// ---- State ----
const cart = new Map(); // testId -> qty
let appliedPromo = null;
let currentSubtotal = 0;
let currentDiscount = 0;
let currentTotal = 0;

document.addEventListener("DOMContentLoaded", async () => {
  console.log('📄 DOMContentLoaded event fired');

  // Check authentication status on page load
  await checkAuthStatus();

  // Load tests from API before rendering
  await loadTestsFromAPI();

  // ---- Elements ----
  const testsContainer = document.getElementById("testsContainer");
  const categoryTemplate = document.getElementById("categoryTemplate");
  const testTemplate = document.getElementById("testTemplate");

  const testTags = document.querySelectorAll(".test-tag");
  const filterCategory = document.getElementById("filterCategory");
  const priceRange = document.getElementById("priceRange");
  const searchStatus = document.getElementById("searchStatus");

  const cartListEl = document.getElementById("cartList");
    // Hero quick booking elements
  const heroCitySelect = document.getElementById('citySelect');
  const heroPurpose = document.getElementById('heroPurpose');
  const heroQuickBook = document.getElementById('heroQuickBook');
  const heroViewTests = document.getElementById('heroViewTests');
  const bookingCitySelect = document.getElementById('city'); // patient details city

  const cartEmptyEl = document.querySelector("#cartSummary .cart-empty");

  const subtotalEl = document.getElementById("subtotal");
  const discountEl = document.getElementById("discount");
  const totalEl = document.getElementById("total");

  const subtotalInput = document.getElementById("subtotalInput");
  const discountInput = document.getElementById("discountInput");
  const totalInput = document.getElementById("totalInput");

  const promoInput = document.getElementById("promo");
  const applyPromoBtn = document.getElementById("applyPromoBtn");
  const promoMessage = document.getElementById("promoMessage");

  const bookingForm = document.getElementById("bookingForm");
  const formErrors = document.getElementById("formErrors");
  const formStatus = document.getElementById("formStatus");

  const slotDate = document.getElementById("slotDate");
  const slotTime = document.getElementById("slotTime");

  const reportInput = document.getElementById("report");
  const reportPreview = document.getElementById("reportPreview");

  const clearCartBtn = document.getElementById("clearCart");

  const detailsDialog = document.getElementById("testDetailsDialog");
  const detailsBody = document.getElementById("testDetailsBody");
  const closeDetailsBtn = document.getElementById("closeTestDetails");

  // ---- Utility helpers ----
  const formatINR = (n) => "₹" + n.toLocaleString("en-IN");

  function showError(msg) {
    formErrors.hidden = false;
    formErrors.textContent = msg;
    formStatus.hidden = true;
  }

  function clearError() {
    formErrors.hidden = true;
    formErrors.textContent = "";
  }

  function showStatus(msg) {
    formStatus.hidden = false;
    formStatus.textContent = msg;
    formErrors.hidden = true;
  }

  // Small helpers used by other modules
  function updateCartSummary() {
    // Keep summary & cart render in sync
    try { updateSummary(); } catch (e) { /* noop */ }
    try { renderCart(); } catch (e) { /* noop */ }
  }

  function updateCartUI() {
    try { renderCart(); } catch (e) { /* noop */ }
    try { updateSummary(); } catch (e) { /* noop */ }
  }

  function announce(msg, timeout = 3500) {
    if (!msg) return;
    showStatus(msg);
    setTimeout(() => {
      if (formStatus) {
        formStatus.hidden = true;
        formStatus.textContent = '';
      }
    }, timeout);
  }

  // ---- TESTS RENDERING + SKELETON ----

  // ALL + ANY ke case me hamesha full list, aur category missing ho to bhi drop na ho
  function getFilteredTests() {
    // base list: saare tests
    let list = Array.isArray(TESTS) ? [...TESTS] : [];

    if (!list.length) return [];

    // safe read (agar element na mile to fallback)
    const cat = (filterCategory && filterCategory.value) ? filterCategory.value : "all";
    const pr  = (priceRange && priceRange.value) ? priceRange.value : "any";

    // ----- CATEGORY FILTER -----
    if (cat !== "all") {
      list = list.filter((t) => {
        // agar t.category define nahi hai to include karo (demo data friendly)
        if (!t.category) return true;
        return t.category === cat;
      });
    }

    // ----- PRICE FILTER -----
    if (pr === "0-499") {
      list = list.filter((t) => Number(t.price) < 500);
    } else if (pr === "500-999") {
      list = list.filter(
        (t) => Number(t.price) >= 500 && Number(t.price) <= 999
      );
    } else if (pr === "1000+") {
      list = list.filter((t) => Number(t.price) >= 1000);
    }
    // agar pr === "any" hai to price filter apply hi nahi hoga

    return list;
  }

  // main render
  function renderTests(list, headingText = "Popular tests") {
    testsContainer.innerHTML = "";

    if (!list || list.length === 0) {
      testsContainer.innerHTML =
        '<p class="muted small">No tests found for this filter in demo data.</p>';
      searchStatus.textContent = "No results";
      return;
    }

    const catNode = categoryTemplate.content.firstElementChild.cloneNode(true);
    const titleEl = catNode.querySelector(".categoryTitle");
    const testGrid = catNode.querySelector(".test-grid");

    titleEl.textContent = headingText;

    list.forEach((t, idx) => {
      const card = testTemplate.content.firstElementChild.cloneNode(true);
      card.dataset.testId = t.id;
      // preserve original render order index to allow stable reordering
      card.dataset.originalIndex = idx;

      const nameEl = card.querySelector(".test-name");
      const descEl = card.querySelector(".test-desc");
      const priceEl = card.querySelector(".price-value");
      const addBtn = card.querySelector(".add-btn");
      const detailsBtn = card.querySelector(".details-btn");

      nameEl.textContent = t.name;
      descEl.textContent = t.description || t.desc || "Test description";
      priceEl.textContent = t.price;

      addBtn.dataset.id = t.id;
      addBtn.addEventListener("click", () => handleAddToCart(t.id, addBtn));

      detailsBtn.addEventListener("click", () => openDetails(t));

      testGrid.appendChild(card);
    });

    testsContainer.appendChild(catNode);
    searchStatus.textContent = "Showing tests";
  }

  // skeleton ko show karne ka helper
  function showSkeleton() {
    testsContainer.innerHTML = `
      <div class="loading-state" aria-hidden="true">
        <div class="loading-header small muted">
          Loading popular tests…
        </div>
        <div class="skeleton-grid">
          <div class="skeleton skeleton-test-card"></div>
          <div class="skeleton skeleton-test-card"></div>
          <div class="skeleton skeleton-test-card"></div>
        </div>
      </div>
    `;
  }

  // ---- Details dialog ----
  async function openDetails(test) {
    // Check authentication before showing booking details
    try {
      const response = await fetch('/api/me');
      if (!response.ok) {
        alert('Please log in to book tests.');
        return;
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
      alert('Please log in to book tests.');
      return;
    }

    // Use safe text assignments to avoid injecting untrusted HTML (prevents XSS)
    detailsBody.textContent = test.desc || '';
    const priceP = document.createElement('p');
    priceP.className = 'muted small';
    priceP.textContent = 'Approx. price: ' + formatINR(test.price || 0);
    detailsBody.appendChild(priceP);
    detailsDialog.showModal();
  }

  closeDetailsBtn.addEventListener("click", () => detailsDialog.close());

  // ---- CART LOGIC ----
  function handleAddToCart(testId, buttonEl) {
    cart.set(testId, (cart.get(testId) || 0) + 1);
    renderCart();
    if (buttonEl) {
      buttonEl.disabled = true;
      const orig = buttonEl.textContent;
      buttonEl.textContent = "Added";
      setTimeout(() => {
        buttonEl.disabled = false;
        buttonEl.textContent = orig;
      }, 600);
    }
  }

  function renderCart() {
    cartListEl.innerHTML = "";

    if (cart.size === 0) {
      cartEmptyEl.hidden = false;
    } else {
      cartEmptyEl.hidden = true;
      cart.forEach((qty, id) => {
        const t = TESTS.find((x) => x.id === id);
        if (!t) return;
        const li = document.createElement("li");
        li.className = "cart-item";

        const left = document.createElement('div');
        const nameDiv = document.createElement('div');
        nameDiv.style.fontWeight = '600';
        nameDiv.textContent = t.name;
        const priceDiv = document.createElement('div');
        priceDiv.className = 'muted small';
        priceDiv.textContent = formatINR(t.price);

        left.appendChild(nameDiv);
        left.appendChild(priceDiv);

        const right = document.createElement('div');
        right.style.display = 'flex';
        right.style.alignItems = 'center';
        right.style.gap = '0.3rem';

        const decBtn = document.createElement('button');
        decBtn.type = 'button';
        decBtn.className = 'ghost small';
        decBtn.dataset.action = 'dec';
        decBtn.dataset.id = id;
        decBtn.textContent = '-';

        const qtySpan = document.createElement('span');
        qtySpan.className = 'small';
        qtySpan.textContent = qty;

        const incBtn = document.createElement('button');
        incBtn.type = 'button';
        incBtn.className = 'ghost small';
        incBtn.dataset.action = 'inc';
        incBtn.dataset.id = id;
        incBtn.textContent = '+';

        const remBtn = document.createElement('button');
        remBtn.type = 'button';
        remBtn.className = 'ghost small';
        remBtn.dataset.action = 'remove';
        remBtn.dataset.id = id;
        remBtn.textContent = '✕';

        right.appendChild(decBtn);
        right.appendChild(qtySpan);
        right.appendChild(incBtn);
        right.appendChild(remBtn);

        li.appendChild(left);
        li.appendChild(right);

        cartListEl.appendChild(li);
      });
    }

    updateSummary();
  }

  cartListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!cart.has(id)) return;

    const action = btn.dataset.action;
    if (action === "inc") {
      cart.set(id, cart.get(id) + 1);
    } else if (action === "dec") {
      const q = cart.get(id) - 1;
      if (q <= 0) cart.delete(id);
      else cart.set(id, q);
    } else if (action === "remove") {
      cart.delete(id);
    }
    renderCart();
  });

  clearCartBtn.addEventListener("click", () => {
    cart.clear();
    renderCart();
  });

  // ---- SUMMARY + PROMO ----
  function updateSummary() {
    let subtotal = 0;
    cart.forEach((qty, id) => {
      const t = TESTS.find((x) => x.id === id);
      if (!t) return;
      subtotal += t.price * qty;
    });

    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === "percent") {
        discount = Math.round((subtotal * appliedPromo.value) / 100);
      } else if (appliedPromo.type === "flat") {
        discount = appliedPromo.value;
      }
    }
    const total = Math.max(0, subtotal - discount);

    currentSubtotal = subtotal;
    currentDiscount = discount;
    currentTotal = total;

    subtotalEl.textContent = formatINR(subtotal);
    discountEl.textContent = formatINR(discount);
    totalEl.textContent = formatINR(total);

    subtotalInput.value = subtotal;
    discountInput.value = discount;
    totalInput.value = total;
  }

  function applyPromo() {
    const code = (promoInput.value || "").trim().toUpperCase();
    if (!code) {
      appliedPromo = null;
      promoMessage.textContent = "Enter a promo code";
      updateSummary();
      return;
    }
    const p = PROMOS[code];
    if (!p) {
      appliedPromo = null;
      promoMessage.textContent = "Invalid promo code (demo)";
      updateSummary();
      return;
    }
    appliedPromo = p;
    promoMessage.textContent =
      "Applied: " +
      code +
      (p.type === "percent"
        ? ` (${p.value}% off)`
        : ` (₹${p.value} off)`);
    updateSummary();
  }

  applyPromoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    applyPromo();
  });

  promoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyPromo();
    }
  });

  // ---- FILE VALIDATION & PREVIEW ----
  reportInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    reportPreview.textContent = "No file chosen.";
    if (!file) return;

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      reportPreview.textContent = `File too large (max ${MAX_FILE_MB}MB).`;
      e.target.value = "";
      return;
    }

    reportPreview.textContent = `${file.name} • ${(
      file.size /
      1024 /
      1024
    ).toFixed(2)} MB`;
  });

  // ---- SLOT DATE + TIME ----
  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function initSlotDate() {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10);
    slotDate.min = iso;
    slotDate.value = iso;
    populateSlotsForDate(today);
  }

  function populateSlotsForDate(date) {
    slotTime.innerHTML = "";
    const now = new Date();
    const startHour = 9;
    const endHour = 18;

    for (let h = startHour; h < endHour; h++) {
      const option = document.createElement("option");
      option.value = `${pad(h)}:00`;

      const label = `${pad(h)}:00 - ${pad(h + 1)}:00`;
      let disabled = false;

      if (date.toDateString() === now.toDateString() && h <= now.getHours()) {
        disabled = true;
      }

      option.textContent = disabled ? label + " (not available)" : label;
      if (disabled) option.disabled = true;
      slotTime.appendChild(option);
    }

    // first available slot ko select karo
    const firstAvailable = Array.from(slotTime.options).find(
      (opt) => !opt.disabled
    );
    if (firstAvailable) firstAvailable.selected = true;
  }

  slotDate.addEventListener("change", (e) => {
    const d = new Date(e.target.value + "T00:00:00");
    populateSlotsForDate(d);
  });

  // ---- TEST TAG FILTERS ----
  testTags.forEach((btn) => {
    btn.addEventListener("click", () => {
      const term = (btn.dataset.testName || btn.textContent || "")
        .toLowerCase()
        .trim();
      const filtered = TESTS.filter((t) =>
        t.name.toLowerCase().includes(term)
      );
      searchStatus.textContent = `Showing results for "${btn.textContent.trim()}"`;
      renderTests(filtered, "Matching tests");
    });
  });

  // Category / price filters
  filterCategory.addEventListener("change", () => {
    const list = getFilteredTests();
    searchStatus.textContent = "Filters applied";
    renderTests(list, "Filtered tests");
  });

  priceRange.addEventListener("change", () => {
    const list = getFilteredTests();
    searchStatus.textContent = "Filters applied";
    renderTests(list, "Filtered tests");
  });

  // ---- FORM SUBMIT (basic validation) ----
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    if (cart.size === 0) {
      showError("Please add at least one test to your booking.");
      return;
    }

    // Check authentication before submitting
    try {
      const response = await fetch('/api/me');
      if (!response.ok) {
        showError("Please log in to book tests.");
        return;
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
      showError("Please log in to book tests.");
      return;
    }

    const fullname = bookingForm.fullname.value.trim();
    const phone = bookingForm.phone.value.trim();
    const email = bookingForm.email?.value?.trim() || '';
    const city = bookingForm.city?.value || '';
    const slotDate = bookingForm.slotDate?.value || '';
    const slotTime = bookingForm.slotTime?.value || '';

    if (fullname.length < 3) {
      showError("Full name must be at least 3 characters.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      showError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    // Prepare booking data
    const tests = Array.from(cart.entries()).map(([testId, qty]) => ({
      testId,
      quantity: qty
    }));

    const bookingData = {
      patientName: fullname,
      phone,
      email,
      city,
      date: slotDate,
      time: slotTime,
      tests,
      subtotal: currentSubtotal,
      discount: currentDiscount,
      total: currentTotal,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    showStatus("Submitting booking...");

    try {
      const result = await AppAPIClient.createBooking(bookingData);
      
      if (result && result.id) {
        showStatus("✓ Booking confirmed! Booking ID: " + result.id);
        
        // Clear cart and form
        cart.clear();
        bookingForm.reset();
        appliedPromo = null;
        currentSubtotal = 0;
        currentDiscount = 0;
        currentTotal = 0;
        
        // Update cart display
        if (cartListEl) {
          cartListEl.innerHTML = '';
          cartEmptyEl.hidden = false;
        }
        updateCartSummary();
        
        // Scroll to success message
        setTimeout(() => {
          formStatus.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      } else {
        showError("Failed to submit booking. Please try again.");
      }
    } catch (error) {
      console.error('Booking error:', error);
      showError("Error submitting booking: " + (error.message || 'Unknown error'));
    }
  });

  // ---- INITIALIZATION ----
  function init() {
    console.log('🔍 Init called. TESTS array:', TESTS.length, 'items');
    // Don't show skeleton - render tests immediately
    const list = getFilteredTests();
    console.log('📋 Filtered tests:', list.length, 'items');
    
    if (list && list.length > 0) {
      console.log('✅ Rendering tests...');
      renderTests(list, "Popular tests");
    } else {
      // If no tests found, show a message
      console.warn('❌ No tests found');
      testsContainer.innerHTML = '<p class="muted">No tests available. Please refresh the page.</p>';
    }

    initSlotDate();
    updateSummary();
  }
    // --- HERO QUICK BOOKING HOOKS ---

    // Hero city → booking form city sync
    if (heroCitySelect && bookingCitySelect) {
      heroCitySelect.addEventListener('change', () => {
        bookingCitySelect.value = heroCitySelect.value || '';
      });
    }

    // "View all tests" → scroll to tests section
    if (heroViewTests) {
      heroViewTests.addEventListener('click', () => {
        const testsSection = document.getElementById('tests');
        if (testsSection) {
          testsSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // "Quick book tests" → based on purpose add tests to cart + scroll to booking
    if (heroQuickBook) {
      heroQuickBook.addEventListener('click', async () => {
        // Check authentication before allowing quick booking
        try {
          const response = await fetch('/api/me');
          if (!response.ok) {
            alert('Please log in to book tests.');
            return;
          }
        } catch (error) {
          console.warn('Auth check failed:', error);
          alert('Please log in to book tests.');
          return;
        }

        const purpose = (heroPurpose && heroPurpose.value) || 'general';
        const bundle = QUICK_BUNDLES[purpose] || QUICK_BUNDLES.general;

        if (!bundle || bundle.length === 0) {
          announce('No recommended tests configured for this concern (demo).');
          return;
        }

        // Add each test in bundle to cart (qty += 1)
        bundle.forEach(id => {
          cart.set(id, (cart.get(id) || 0) + 1);
        });

        updateCartUI();

        // Announcement message
        announce(
          'Recommended tests added for ' +
            (PURPOSE_LABELS[purpose] || 'general health checkup') +
            '. You can review them in Your Booking.'
        );

        // Scroll to booking panel
        const bookingHeading = document.getElementById('bookingHeading');
        if (bookingHeading) {
          bookingHeading.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

  init();

  // Attach event listeners for profile UI
  const profileIcon = document.getElementById('profileIcon');
  if (profileIcon) {
    profileIcon.addEventListener('click', toggleProfileDropdown);
  }

  const signOutBtn = document.getElementById('signOut');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', handleSignOut);
  }

  const myOrdersBtn = document.getElementById('myOrders');
  if (myOrdersBtn) {
    myOrdersBtn.addEventListener('click', handleMyOrders);
  }

  const myReportsBtn = document.getElementById('myReports');
  if (myReportsBtn) {
    myReportsBtn.addEventListener('click', handleMyReports);
  }

  const editProfileBtn = document.getElementById('editProfile');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', handleEditProfile);
  }

  const settingsBtn = document.getElementById('settings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', handleSettings);
  }

  // Expose minimal test hooks for automated tests (used by jest/jsdom smoke tests)
  try {
    window.__bloodlabTestHooks = {
      loadFallbackTests: loadFallbackTests,
      formatINR: formatINR,
      updateSummary: updateSummary,
      renderCart: renderCart,
      renderTests: renderTests,
      getTests: () => TESTS,
      cart: cart
    };
    // Expose a live `TESTS` getter for tests and dev tools
    Object.defineProperty(window.__bloodlabTestHooks, 'TESTS', {
      get: () => TESTS
    });
  } catch (e) { /* tests may run in restricted environments */ }
});
// Step logic (safe: only runs if booking form exists)
(function initStepLogic() {
  const bookingFormEl = document.getElementById('bookingForm');
  if (!bookingFormEl) return;

  const stepDots = document.querySelectorAll('.step-indicator li');
  const confirmBtn = document.getElementById('confirmBtn');
  const cartList = document.getElementById('cartList');

  let currentStep = 1;

  function setStep(step) {
    currentStep = step;
    bookingFormEl.classList.remove('step-1', 'step-2', 'step-3');
    bookingFormEl.classList.add(`step-${step}`);
    stepDots.forEach((li) => {
      li.classList.toggle('active', Number(li.dataset.step) === step);
    });
  }

  setStep(1);

  bookingFormEl.addEventListener('submit', function (e) {
    if (currentStep === 1) {
      e.preventDefault();
      const hasItems = cartList && cartList.children.length > 0;
      if (!hasItems) {
        alert('Please add at least one test before continuing.');
        return;
      }
      setStep(2);
      const nameField = document.getElementById('fullname');
      if (nameField) nameField.focus();
      return;
    }

    if (currentStep === 2) {
      e.preventDefault();
      const name = document.getElementById('fullname');
      const phone = document.getElementById('phone');
      const slotDate = document.getElementById('slotDate');
      const slotTime = document.getElementById('slotTime');

      if (!name.value.trim()) {
        alert('Please enter patient name.');
        name.focus();
        return;
      }
      if (!/^[6-9]\d{9}$/.test(phone.value.trim())) {
        alert('Please enter a valid 10-digit mobile number.');
        phone.focus();
        return;
      }
      if (!slotDate.value) {
        alert('Please select a date.');
        slotDate.focus();
        return;
      }
      if (!slotTime.value) {
        alert('Please select a time slot.');
        slotTime.focus();
        return;
      }

      setStep(3);
      return;
    }

    if (currentStep === 3) {
      // final submit allowed to continue
    }
  });
})();



/* Additional UI flows: OTP login, doctor booking, reminders, health score */
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    // OTP elements
    const loginFab = document.getElementById('loginFab');
    const otpModal = document.getElementById('otpModal');
    const otpContact = document.getElementById('otpContact');
    const sendOtp = document.getElementById('sendOtp');
    const otpSentMsg = document.getElementById('otpSentMsg');
    const otpCode = document.getElementById('otpCode');
    const verifyOtp = document.getElementById('verifyOtp');
    const closeOtp = document.getElementById('closeOtp');

    function show(el){ if (el) el.classList.remove('hidden'); }
    function hide(el){ if (el) el.classList.add('hidden'); }

    if (loginFab) loginFab.addEventListener('click', (e)=>{ e.preventDefault(); show(otpModal); });
    if (closeOtp) closeOtp.addEventListener('click', ()=> hide(otpModal));

    if (sendOtp) sendOtp.addEventListener('click', async ()=>{
      const contact = (otpContact && otpContact.value) || '';
      if (!contact) { alert('Enter phone or email'); return; }
      try {
        const r = await fetch('/api/auth/request-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone: contact, email: contact }) });
        const j = await r.json();
        if (j.ok) { otpSentMsg.style.display='block'; }
        else alert('Failed to send OTP');
      } catch (e){ console.warn(e); alert('Network error'); }
    });

    if (verifyOtp) verifyOtp.addEventListener('click', async ()=>{
      const contact = (otpContact && otpContact.value) || '';
      const code = (otpCode && otpCode.value) || '';
      if (!contact || !code) { alert('Enter contact and OTP'); return; }
      try {
        const r = await fetch('/api/auth/verify-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone: contact, email: contact, code }) });
        const j = await r.json();
        if (j.ok) {
          hide(otpModal);
          alert('Logged in as ' + (j.user && j.user.id));
          // Update UI immediately after login
          await checkAuthStatus();
        }
        else alert(j.error || 'Invalid OTP');
      } catch (e){ console.warn(e); alert('Network error'); }
    });

    // Doctor booking
    const doctorModal = document.getElementById('doctorModal');
    const doctorSelect = document.getElementById('doctorSelect');
    const bookDoctor = document.getElementById('bookDoctor');
    const closeDoctor = document.getElementById('closeDoctor');
    const consultName = document.getElementById('consultName');
    const consultEmail = document.getElementById('consultEmail');
    const consultDate = document.getElementById('consultDate');
    const consultTime = document.getElementById('consultTime');

    async function loadDoctors(){
      try { const r = await fetch('/api/doctors'); const list = await r.json(); doctorSelect.innerHTML = '<option value="">Select doctor</option>' + list.map(d=>`<option value="${d.id}">${d.name || d.id}</option>`).join(''); } catch(e){ console.warn(e); }
    }

    // open doctor modal via help or other flows — for demo attach to loginFab longclick
    if (doctorSelect) loadDoctors();
    if (closeDoctor) closeDoctor.addEventListener('click', ()=> hide(doctorModal));
    if (bookDoctor) bookDoctor.addEventListener('click', async ()=>{
      const payload = { doctorId: doctorSelect.value, name: consultName.value, email: consultEmail.value, date: consultDate.value, time: consultTime.value };
      if (!payload.doctorId) { alert('Select doctor'); return; }
      try { const r = await fetch('/api/consultations', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); const j = await r.json(); if (r.ok) { hide(doctorModal); alert('Consultation scheduled'); } else alert(j.error||'Failed'); } catch(e){ console.warn(e); alert('Network error'); }
    });

    // Reminders
    const reminderModal = document.getElementById('reminderModal');
    const createReminder = document.getElementById('createReminder');
    const closeReminder = document.getElementById('closeReminder');
    if (closeReminder) closeReminder.addEventListener('click', ()=> hide(reminderModal));
    if (createReminder) createReminder.addEventListener('click', async ()=>{
      const email = document.getElementById('reminderEmail').value;
      const when = document.getElementById('reminderWhen').value;
      const message = document.getElementById('reminderMessage').value;
      if (!email || !when) { alert('Email and date/time required'); return; }
      try { const r = await fetch('/api/reminders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, when, message }) }); const j = await r.json(); if (r.id) { hide(reminderModal); alert('Reminder created'); } else alert('Failed'); } catch(e){ console.warn(e); alert('Network error'); }
    });

    // Health score
    const healthScoreValue = document.getElementById('healthScoreValue');
    const fetchHealthScore = document.getElementById('fetchHealthScore');
    if (fetchHealthScore) fetchHealthScore.addEventListener('click', async ()=>{
      // try to get logged-in user id from server session
      try { const userResp = await fetch('/api/bookings'); /* we don't have auth endpoint; assume user picks id manually for demo */ }
      catch(e){}
      const userId = prompt('Enter user id (e.g. USR001) to fetch health score');
      if (!userId) return;
      try { const r = await fetch(`/api/healthscore/${encodeURIComponent(userId)}`); const j = await r.json(); if (j && j.score !== undefined) { healthScoreValue.textContent = j.score; } else healthScoreValue.textContent = '—'; } catch(e){ console.warn(e); healthScoreValue.textContent='—'; }
    });

    // small UI shortcuts: clicking help-fab opens reminders (demo)
    const helpFab = document.querySelector('.help-fab');
    if (helpFab) helpFab.addEventListener('click', (e)=>{ /* keep existing tel behavior */ });

  });
})();

/* ===========================
   Symptoms filters for quick tags
   =========================== */

(function() {
  // Symptom -> test-tag names mapping (data-test-name se match hoga)
  const SYMPTOM_MAP = {
    all: [
      'Pregnancy Test',
      'Full Body Checkups',
      'Covid 19 Test',
      'Heart Test',
      'Kidney Test',
      'Liver Test',
      'CBC Test',
      'Cholesterol Test',
      'HbA1c Test',
      'Hepatitis B Test',
      'Kidney Function Test',
      'Liver Function Test',
      'Sugar Test',
      'Thyroid Test',
      'Typhoid Test',
      'Uric Acid Test',
      'Vitamin B12 Test',
      'Vitamin D Test',
      'Allergy Test',
      'Arthritis Test',
      'Cancer Test',
      'Bone And Joint',
      'Dengue Test',
      'Diabetes Test',
      'Rheumatoid Test',
      'Tuberculosis Test',
      'Infertility Test',
      'Diabetes Care',
      'Anemia Test',
      'GastroIntestinal',
      'Autoimmune Disorders',
      'Fever Test'
    ],

    fever: [
      'Fever Test',
      'Dengue Test',
      'Typhoid Test',
      'Covid 19 Test'
    ],

    diabetes: [
      'Sugar Test',
      'Diabetes Test',
      'HbA1c Test',
      'Diabetes Care'
    ],

    thyroid: [
      'Thyroid Test'
    ],

    heart: [
      'Heart Test',
      'Cholesterol Test',
      'Lipid Profile',       // agar baad me add karo to chalega
    ],

    pregnancy: [
      'Pregnancy Test',
      'Infertility Test'
    ],

    full: [
      'Full Body Checkups',
      'CBC Test',
      'Liver Function Test',
      'Kidney Function Test'
    ]
  };

  // DOM elements
  const symptomButtons = document.querySelectorAll('.symptom-btn');

  if (!symptomButtons.length) {
    // No symptom buttons — feature not present on page
    return;
  }

  function applySymptomFilter(key) {
    const list = SYMPTOM_MAP[key] || SYMPTOM_MAP.all;

    // Buttons ka active / aria-pressed state
    symptomButtons.forEach(btn => {
      const isActive = btn.dataset.symptom === key;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    // Re-query test tags and rendered test cards so this works after render
    const testTags = Array.from(document.querySelectorAll('.test-tag'));
    const testCards = Array.from(document.querySelectorAll('.test-card'));

    // Helper to decide match by test name
    function nameMatches(name) {
      if (!name) return false;
      return list.includes(name.trim());
    }

    // Update tag cloud (if present)
    testTags.forEach(tag => {
      const name = (tag.dataset.testName || tag.textContent || '').trim();
      const match = nameMatches(name);
      tag.classList.remove('dimmed', 'highlight');
      if (key === 'all') return;
      if (match) tag.classList.add('highlight');
      else tag.classList.add('dimmed');
    });

    // Update test cards (rendered list)
    testCards.forEach(card => {
      const nameEl = card.querySelector('.test-name');
      const name = nameEl ? nameEl.textContent : '';
      card.classList.remove('dimmed', 'highlight');
      if (key === 'all') return;
      if (nameMatches(name)) card.classList.add('highlight');
      else card.classList.add('dimmed');
    });

    // Reorder cards so matching tests come first for easy access
    const grids = Array.from(document.querySelectorAll('.test-grid'));
    grids.forEach(grid => {
      const cards = Array.from(grid.querySelectorAll('.test-card'));
      cards.sort((a, b) => {
        const aName = a.querySelector('.test-name')?.textContent || '';
        const bName = b.querySelector('.test-name')?.textContent || '';
        const aMatch = nameMatches(aName) ? 0 : 1;
        const bMatch = nameMatches(bName) ? 0 : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;
        return Number(a.dataset.originalIndex || 0) - Number(b.dataset.originalIndex || 0);
      });
      // append in new order (moves existing nodes)
      cards.forEach(c => grid.appendChild(c));
    });
  }

  // Button click listeners
  symptomButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.symptom || 'all';
      applySymptomFilter(key);
    });
  });

  // Page load pe default: "Show all" active
  document.addEventListener('DOMContentLoaded', () => {
    applySymptomFilter('all');
  });
})();

/* Floating cart: duplicate implementation removed — single implementation retained later in the file */

/* Floating mini-cart (position near clicked Add button — right side, inside viewport) */
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const floatingCart = document.getElementById('floatingCart');
    const fcToggle = document.getElementById('floatingCartToggle');
    const fcClose = document.getElementById('fcClose');
    const fcList = document.getElementById('fcList');
    const fcSubtotal = document.getElementById('fcSubtotal');
    const fcCheckout = document.getElementById('fcCheckout');
    const fcPay = document.getElementById('fcPay');
    const fcDone = document.getElementById('fcDone');
    if (!floatingCart) return;

    const miniCart = new Map();
    let lastAnchor = null;
    let locked = false;

    const fmt = n => '₹' + (Number(n) || 0).toLocaleString('en-IN');

    function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

    // Position cart with top relative to clicked element (so it appears 'in front' vertically)
    function positionFloatingNear(el){
      if (!el || !floatingCart) return;
      const rect = el.getBoundingClientRect();
      const panel = floatingCart.querySelector('.fc-panel');
      const panelH = panel ? panel.offsetHeight : 320;
      // desired top so that cart center aligns with element center
      const elCenterY = rect.top + rect.height/2;
      // convert to page coordinates (include scroll)
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      let topPx = Math.round(scrollY + elCenterY - panelH/2);
      // clamp to viewport (so cart never goes off-screen)
      const minTop = scrollY + 12;
      const maxTop = scrollY + window.innerHeight - panelH - 12;
      topPx = clamp(topPx, minTop, Math.max(minTop, maxTop));
      // set style
      floatingCart.style.top = topPx + 'px';
      // ensure right side anchor (CSS sets right)
      // remove bottom to avoid conflicts
      floatingCart.style.removeProperty('bottom');
    }

    function showCart(nearEl=null){
      floatingCart.classList.remove('hidden');
      floatingCart.classList.add('right-expanded');
      floatingCart.classList.remove('right-collapsed');
      if (nearEl) {
        lastAnchor = nearEl;
        // small timeout to allow layout, then position
        setTimeout(()=> positionFloatingNear(nearEl), 24);
      } else {
        // center vertically as fallback
        const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        floatingCart.style.top = (scrollY + window.innerHeight/2 - (floatingCart.offsetHeight/2)) + 'px';
      }
    }

    function hideCart(){
      floatingCart.classList.add('hidden');
      floatingCart.classList.remove('right-expanded');
      floatingCart.classList.add('right-collapsed');
    }

    function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

    function render(){
      fcList.innerHTML = '';
      if (miniCart.size === 0) {
        floatingCart.querySelector('.fc-empty').style.display = 'block';
        fcSubtotal.textContent = fmt(0);
        return;
      }
      floatingCart.querySelector('.fc-empty').style.display = 'none';
      let subtotal = 0;
      for (const [id, item] of miniCart.entries()) {
        const li = document.createElement('li');
        li.className = 'fc-item';
        li.innerHTML = `
          <div>
            <div class="name">${escapeHtml(item.name)}</div>
            <div class="muted small">${fmt(item.price)}</div>
          </div>
          <div style="display:flex;gap:0.4rem;align-items:center">
            <button class="btn small fc-dec" data-id="${id}">-</button>
            <div class="qty">${item.qty}</div>
            <button class="btn small fc-inc" data-id="${id}">+</button>
          </div>
        `;
        fcList.appendChild(li);
        subtotal += item.price * item.qty;
      }
      fcSubtotal.textContent = fmt(subtotal);
    }

    // global helper to add (used by add button handler below)
    window.bloodlab_addToMiniCart = function(details, anchorElement=null){
      if (locked) return;
      if (!details || !details.id) return;
      const id = details.id;
      const name = details.name || 'Test';
      const price = Number(details.price || 0);
      if (miniCart.has(id)) miniCart.get(id).qty += 1;
      else miniCart.set(id, { id, name, price, qty: 1 });
      render();
      showCart(anchorElement);
    };

    // attach Add button listener (delegation)
    document.addEventListener('click', (e)=>{
      // match both class and data-action patterns
      const add = e.target.closest('button.add-btn, button[data-action="add-test"], .add-btn');
      if (!add) return;
      if (locked) return;
      const card = add.closest('.test-card') || add.closest('li') || null;
      const id = add.dataset.id || (card && card.dataset.testId) || null;
      const nameNode = card && (card.querySelector('.test-name') || card.querySelector('h3'));
      const priceNode = card && (card.querySelector('.price-value') || card.querySelector('.price'));
      const name = nameNode ? nameNode.textContent.trim() : (id || 'Test');
      let price = 0;
      if (priceNode) {
        price = Number((priceNode.textContent || '').replace(/[^\d]/g,'')) || 0;
      } else if (window.TESTS?.length) {
        const found = window.TESTS.find(t=>t.id===id);
        price = found ? found.price : 0;
      }
      // Update main cart
      cart.set(id, (cart.get(id) || 0) + 1);
      updateCartUI();
      // Update mini cart
      const safeId = id || name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'');
      window.bloodlab_addToMiniCart({ id: safeId, name, price }, add);
      // click feedback
      const prev = add.textContent;
      add.disabled = true;
      add.textContent = 'Added';
      setTimeout(()=>{ add.disabled=false; add.textContent = prev; }, 700);
    });

    // inc/dec inside mini-cart
    fcList.addEventListener('click', (e)=>{
      const inc = e.target.closest('.fc-inc');
      const dec = e.target.closest('.fc-dec');
      if (inc) {
        const id = inc.dataset.id;
        if (miniCart.has(id)) miniCart.get(id).qty += 1;
        render();
      } else if (dec) {
        const id = dec.dataset.id;
        if (!miniCart.has(id)) return;
        miniCart.get(id).qty -= 1;
        if (miniCart.get(id).qty <= 0) miniCart.delete(id);
        render();
      }
    });

    // toggle / close
    if (fcToggle) fcToggle.addEventListener('click', ()=> {
      if (floatingCart.classList.contains('right-expanded')) hideCart();
      else showCart(lastAnchor);
    });
    if (fcClose) fcClose.addEventListener('click', hideCart);

    // checkout scroll + move to booking step
    if (fcCheckout) fcCheckout.addEventListener('click', ()=> {
      const bookingPanel = document.querySelector('[data-component="booking-panel"]');
      if (bookingPanel) bookingPanel.scrollIntoView({ behavior:'smooth', block:'center' });
      const bookingForm = document.getElementById('bookingForm');
      if (bookingForm) { bookingForm.classList.add('step-2'); bookingForm.classList.remove('step-1'); }
      // hide floating cart after navigating to booking
      hideCart();
    });

    // Pay: request a server-side order (Razorpay) or fallback to UPI QR
    if (fcPay) fcPay.addEventListener('click', async ()=>{
      // compute subtotal amount (number)
      let amt = 0;
      for (const [, item] of miniCart.entries()) amt += (item.price||0) * (item.qty||1);
      const amount = (Math.round((amt + Number.EPSILON) * 100) / 100).toFixed(2);

      try {
        const resp = await fetch('/api/pay/create-order', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Number(amount) })
        });
        if (!resp.ok) throw new Error('Create order failed');
        const data = await resp.json();

        if (data.provider === 'razorpay' && data.order && data.key) {
          // Launch Razorpay Checkout
          const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement('script'); s.src = src; s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
          });

          await loadScript('https://checkout.razorpay.com/v1/checkout.js');
          const options = {
            key: data.key,
            amount: data.order.amount,
            currency: data.order.currency,
            name: 'BloodLab',
            description: 'Booking payment',
            order_id: data.order.id,
            handler: function (response) {
              // verify with server
              fetch('/api/pay/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'razorpay', razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, bookingId: data.bookingId }) })
              .then(r => r.json()).then(j => {
                if (j && j.ok) {
                  alert('Payment successful — booking confirmed');
                  // optionally update UI / booking list
                  hideCart();
                } else {
                  alert('Payment verification failed');
                }
              }).catch(e => { console.error(e); alert('Verification error'); });
            },
            prefill: { name: '', email: '' },
            notes: {}
          };
          // @ts-ignore
          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        }

        // Fallback UPI QR
        if (data.provider === 'upi') {
          const upiVpa = data.upiVpa || 'your-upi@bank';
          const qrImg = document.getElementById('qrImage');
          const upiUri = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent('Lab Payment')}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent('Booking payment')}`;
          const qrUrl = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=' + encodeURIComponent(upiUri);
          if (qrImg) qrImg.src = qrUrl;
          const upiLink = document.getElementById('upiLink'); if (upiLink) { upiLink.href = upiUri; upiLink.textContent = `Pay ₹${amount}`; }
          // populate app-specific quick links (they all use the same UPI URI and rely on app handlers)
          const gpay = document.getElementById('upiGooglePay'); if (gpay) gpay.href = upiUri;
          const phonepe = document.getElementById('upiPhonePe'); if (phonepe) phonepe.href = upiUri;
          const paytm = document.getElementById('upiPaytm'); if (paytm) paytm.href = upiUri;
          const modal = document.getElementById('paymentModal'); if (modal) modal.classList.remove('hidden');
          return;
        }
      } catch (err) {
        console.warn('Payment create order failed', err);
        // show fallback QR
        const upiVpa = 'your-upi@bank';
        const qrImg = document.getElementById('qrImage');
        const upiUri = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent('Lab Payment')}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent('Booking payment')}`;
        const qrUrl = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=' + encodeURIComponent(upiUri);
        if (qrImg) qrImg.src = qrUrl;
        const upiLink = document.getElementById('upiLink'); if (upiLink) { upiLink.href = upiUri; upiLink.textContent = `Pay ₹${amount}`; }
        const modal = document.getElementById('paymentModal'); if (modal) modal.classList.remove('hidden');
      }
    });

    // modal close handler
    const closePayment = document.getElementById('closePayment');
    if (closePayment) closePayment.addEventListener('click', ()=>{
      const modal = document.getElementById('paymentModal');
      if (modal) modal.classList.add('hidden');
    });

    // Done => lock, navigate to booking/details and show booking step
    if (fcDone) fcDone.addEventListener('click', ()=> {
      locked = true;
      floatingCart.classList.add('fc-locked');
      fcDone.textContent = 'Locked ✓'; fcDone.disabled = true;
      // Scroll to booking panel and show details (step-2)
      const bookingPanel = document.querySelector('[data-component="booking-panel"]');
      if (bookingPanel) bookingPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const bookingForm = document.getElementById('bookingForm');
      if (bookingForm) { bookingForm.classList.add('step-2'); bookingForm.classList.remove('step-1'); }
      // hide the floating cart after navigating to booking (keep it out of the way)
      hideCart();
    });

    // reposition on resize/scroll to follow anchor
    window.addEventListener('resize', ()=> { if (lastAnchor) positionFloatingNear(lastAnchor); });
    window.addEventListener('scroll', ()=> { if (lastAnchor) positionFloatingNear(lastAnchor); });

    // initial render
    render();
  });
})();
