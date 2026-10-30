/**
 * Digital Menu Renderer for Sharjah Hotel Yaru
 * Handles real-time search, category tab switching, item availability,
 * Firestore data synchronization with fallback to seed data.
 */
import { 
  collection, 
  getDocs, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { db, handleFirestoreError, OperationType } from "./firebase-config.js";
import { INITIAL_MENU_ITEMS, CATEGORIES } from "./seed-data.js";
import { getCurrentLanguage, TRANSLATIONS } from "./language.js";
import { cart } from "./cart.js";

class MenuController {
  constructor() {
    this.menuItems = [...INITIAL_MENU_ITEMS];
    this.activeCategory = "all";
    this.searchQuery = "";
    this.isLoading = true;

    this.init();
  }

  async init() {
    this.renderCategoryPills();
    this.bindEvents();
    await this.loadDishesFromFirestore();
  }

  renderCategoryPills() {
    const container = document.getElementById("categoryTabsContainer");
    if (!container) return;

    const currentLang = getCurrentLanguage();
    const allLabel = currentLang === "ur" ? "تمام کیٹیگریز" :
                     currentLang === "ps" ? "ټول ډولونه" : "All Dishes";

    let html = `
      <button type="button" class="category-pill ${this.activeCategory === 'all' ? 'active' : ''}" data-category="all">
        ${allLabel}
      </button>
    `;

    CATEGORIES.forEach(cat => {
      const catName = currentLang === "ur" ? cat.nameUr :
                      currentLang === "ps" ? cat.namePs : cat.nameEn;
      html += `
        <button type="button" class="category-pill ${this.activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
          ${catName}
        </button>
      `;
    });

    container.innerHTML = html;
  }

  bindEvents() {
    // Category pill click delegation
    const catContainer = document.getElementById("categoryTabsContainer");
    if (catContainer) {
      catContainer.addEventListener("click", (e) => {
        const pill = e.target.closest(".category-pill");
        if (pill) {
          this.activeCategory = pill.dataset.category;
          catContainer.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          this.renderMenuGrid();
        }
      });
    }

    // Search input
    const searchInput = document.getElementById("menuSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderMenuGrid();
      });
    }

    // Clear search button
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          this.searchQuery = "";
          this.renderMenuGrid();
        }
      });
    }

    // Card Add To Cart delegation
    const grid = document.getElementById("menuGrid");
    if (grid) {
      grid.addEventListener("click", (e) => {
        const addBtn = e.target.closest("[data-add-dish]");
        if (addBtn) {
          const dishId = addBtn.dataset.addDish;
          const dish = this.menuItems.find(item => item.id === dishId);
          if (dish && dish.available) {
            cart.addItem(dish);
            const originalHtml = addBtn.innerHTML;
            addBtn.classList.add("btn-success");
            addBtn.innerHTML = `<span>Added ✓</span>`;
            setTimeout(() => {
              addBtn.classList.remove("btn-success");
              addBtn.innerHTML = originalHtml;
            }, 1200);
          }
        }
      });
    }

    // React to language switch
    window.addEventListener("languageChanged", () => {
      this.renderCategoryPills();
      this.renderMenuGrid();
    });
  }

  async loadDishesFromFirestore() {
    const loadingState = document.getElementById("menuLoadingSpinner");
    try {
      if (loadingState) loadingState.style.display = "flex";

      // Attempt live snapshot
      onSnapshot(collection(db, "menuItems"), (snapshot) => {
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach(docSnap => {
            items.push({ id: docSnap.id, ...docSnap.data() });
          });
          this.menuItems = items;
          console.log(`Loaded ${items.length} items from Firestore menuItems.`);
        } else {
          console.info("Firestore menuItems is empty. Displaying built-in seed menu catalog.");
          this.menuItems = [...INITIAL_MENU_ITEMS];
        }
        this.isLoading = false;
        if (loadingState) loadingState.style.display = "none";
        this.renderMenuGrid();
      }, (error) => {
        console.warn("Could not listen to Firestore (offline/rules). Fallback to seed data:", error.message);
        this.menuItems = [...INITIAL_MENU_ITEMS];
        this.isLoading = false;
        if (loadingState) loadingState.style.display = "none";
        this.renderMenuGrid();
      });
    } catch (err) {
      console.warn("Error initiating menu fetch:", err);
      this.menuItems = [...INITIAL_MENU_ITEMS];
      this.isLoading = false;
      if (loadingState) loadingState.style.display = "none";
      this.renderMenuGrid();
    }
  }

  renderMenuGrid() {
    const grid = document.getElementById("menuGrid");
    if (!grid) return;

    const lang = getCurrentLanguage();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

    const filtered = this.menuItems.filter(item => {
      const matchesCategory = this.activeCategory === "all" || item.category === this.activeCategory;
      if (!matchesCategory) return false;

      if (!this.searchQuery) return true;

      const q = this.searchQuery;
      const nameEn = (item.nameEn || "").toLowerCase();
      const nameUr = (item.nameUr || "").toLowerCase();
      const namePs = (item.namePs || "").toLowerCase();
      const descEn = (item.descriptionEn || "").toLowerCase();
      const descUr = (item.descriptionUr || "").toLowerCase();
      const descPs = (item.descriptionPs || "").toLowerCase();

      return nameEn.includes(q) || nameUr.includes(q) || namePs.includes(q) ||
             descEn.includes(q) || descUr.includes(q) || descPs.includes(q);
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="menu-empty-state">
          <div class="empty-icon">🍽️</div>
          <h3>${lang === 'ur' ? 'کوئی ڈش نہیں ملی' : lang === 'ps' ? 'هیڅ خواړه ونه موندل شول' : 'No Dishes Found'}</h3>
          <p>${lang === 'ur' ? 'براہ کرم کوئی دوسرا لفظ تلاش کریں یا کیٹیگری بدلیں' : lang === 'ps' ? 'مهرباني وکړئ بل نوم وپلټئ یا بل ډول وټاکئ' : 'Try searching with another keyword or pick a different category.'}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const name = lang === "ur" ? (item.nameUr || item.nameEn) :
                   lang === "ps" ? (item.namePs || item.nameEn) : item.nameEn;
      const desc = lang === "ur" ? (item.descriptionUr || item.descriptionEn) :
                   lang === "ps" ? (item.descriptionPs || item.descriptionEn) : item.descriptionEn;
      const catObj = CATEGORIES.find(c => c.id === item.category);
      const catLabel = catObj ? (lang === "ur" ? catObj.nameUr : lang === "ps" ? catObj.namePs : catObj.nameEn) : item.category;

      const isAvail = item.available !== false;
      const statusText = isAvail ? (dict.available || "Available") : (dict.outOfStock || "Sold Out");
      const statusClass = isAvail ? "badge-available" : "badge-soldout";
      const btnText = isAvail ? (dict.btnAddToCart || "Add to Order") : (dict.outOfStock || "Sold Out");

      return `
        <article class="food-card ${!isAvail ? 'is-unavailable' : ''}">
          <div class="food-card-media">
            <img 
              src="${item.image}" 
              alt="${name}" 
              class="food-card-img" 
              loading="lazy" 
              onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80'" 
            />
            <span class="category-badge">${catLabel}</span>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>
          <div class="food-card-content">
            <div class="food-card-header">
              <h3 class="food-card-title">${name}</h3>
              <div class="food-card-price">Rs. ${Number(item.price).toLocaleString()}</div>
            </div>
            <p class="food-card-desc">${desc || ''}</p>
            <div class="food-card-footer">
              <span class="price-sample-tag">${dict.currency} ${Number(item.price).toLocaleString()}</span>
              <button 
                type="button" 
                class="btn-add-cart ${!isAvail ? 'disabled' : ''}" 
                data-add-dish="${item.id}"
                ${!isAvail ? 'disabled' : ''}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span>${btnText}</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }
}

// Instantiate when menu grid exists
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("menuGrid")) {
    window.menuController = new MenuController();
  }
});
