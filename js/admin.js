/**
 * Admin Dashboard Controller for Sharjah Hotel Yaru
 * Handles real-time order tracking, menu item CRUD operations,
 * restaurant settings updates, database seeding, and QR code downloads.
 */
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { db, handleFirestoreError, OperationType } from "./firebase-config.js";
import { authService } from "./auth.js";
import { CATEGORIES, seedDatabaseIfEmpty, INITIAL_SETTINGS } from "./seed-data.js";
import { renderMenuQRCode, downloadMenuQRCode, getProductionMenuUrl } from "./qr.js";

class AdminDashboard {
  constructor() {
    this.orders = [];
    this.menuItems = [];
    this.currentEditingDish = null;
    this.activeTab = "overview";
    this.unsubOrders = null;
    this.unsubMenu = null;

    this.init();
  }

  init() {
    this.bindTabNavigation();
    this.bindActionButtons();
    this.bindMenuModal();
    this.bindSettingsForm();

    // Listen for auth readiness
    window.addEventListener("authStateChanged", (e) => {
      const { user, isAdmin } = e.detail;
      if (user && isAdmin) {
        this.startDataListeners();
        this.renderQRCodeSection();
      } else {
        this.stopDataListeners();
      }
    });
  }

  bindTabNavigation() {
    document.querySelectorAll(".admin-nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        if (!tab) return;

        this.activeTab = tab;
        document.querySelectorAll(".admin-nav-item").forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        document.querySelectorAll(".admin-tab-section").forEach(sec => sec.classList.remove("active"));
        const target = document.getElementById(`tab-${tab}`);
        if (target) target.classList.add("active");
      });
    });
  }

  bindActionButtons() {
    // Seed Database button
    const seedBtn = document.getElementById("btnAdminSeedDB");
    if (seedBtn) {
      seedBtn.addEventListener("click", async () => {
        if (!confirm("Do you want to initialize the database with 50+ authentic dishes across all 10 categories?")) return;
        seedBtn.disabled = true;
        seedBtn.textContent = "Seeding dishes...";
        try {
          const res = await seedDatabaseIfEmpty();
          alert(res.seeded ? `Successfully inserted ${res.count} items!` : `Database already has ${res.count} items.`);
        } catch (err) {
          alert("Error seeding database: " + err.message);
        } finally {
          seedBtn.disabled = false;
          seedBtn.textContent = "Seed 50+ Dishes";
        }
      });
    }

    // Google Sign-In button on admin login screen
    const googleLoginBtn = document.getElementById("btnAdminGoogleLogin");
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener("click", async () => {
        try {
          googleLoginBtn.disabled = true;
          googleLoginBtn.textContent = "Opening Google Sign-In...";
          await authService.loginWithGoogle();
        } catch (err) {
          alert("Sign-in failed: " + err.message);
        } finally {
          googleLoginBtn.disabled = false;
          googleLoginBtn.textContent = "Sign in with Google";
        }
      });
    }

    // Admin Logout button
    const logoutBtn = document.getElementById("btnAdminLogout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        authService.logout();
      });
    }

    // Download QR Code button
    const downloadQrBtn = document.getElementById("btnDownloadQrCode");
    if (downloadQrBtn) {
      downloadQrBtn.addEventListener("click", () => {
        downloadMenuQRCode("Sharjah-Hotel-Yaru-Digital-Menu-QR.png");
      });
    }
  }

  startDataListeners() {
    this.stopDataListeners();

    // Listen to orders collection
    try {
      this.unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
        const list = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Sort descending by creation
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        this.orders = list;
        this.renderStats();
        this.renderOrdersTable();
      }, (err) => {
        console.warn("Orders listener error:", err);
      });
    } catch (e) {
      console.warn("Could not attach orders listener:", e);
    }

    // Listen to menuItems collection
    try {
      this.unsubMenu = onSnapshot(collection(db, "menuItems"), (snapshot) => {
        const list = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        this.menuItems = list;
        this.renderStats();
        this.renderMenuItemsTable();
      }, (err) => {
        console.warn("Menu listener error:", err);
      });
    } catch (e) {
      console.warn("Could not attach menu listener:", e);
    }

    // Load settings
    this.loadRestaurantSettings();
  }

  stopDataListeners() {
    if (this.unsubOrders) this.unsubOrders();
    if (this.unsubMenu) this.unsubMenu();
  }

  renderStats() {
    const totalDishes = this.menuItems.length;
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(o => o.status === "Pending" || o.status === "Preparing").length;
    const completedOrders = this.orders.filter(o => o.status === "Completed").length;

    const elTotalMenu = document.getElementById("statTotalMenu");
    const elTotalOrders = document.getElementById("statTotalOrders");
    const elPendingOrders = document.getElementById("statPendingOrders");
    const elCompletedOrders = document.getElementById("statCompletedOrders");

    if (elTotalMenu) elTotalMenu.textContent = totalDishes;
    if (elTotalOrders) elTotalOrders.textContent = totalOrders;
    if (elPendingOrders) elPendingOrders.textContent = pendingOrders;
    if (elCompletedOrders) elCompletedOrders.textContent = completedOrders;
  }

  renderOrdersTable() {
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;

    if (this.orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-muted">No orders received yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.orders.map(order => {
      const itemsSummary = (order.items || []).map(i => `${i.nameEn} (x${i.quantity})`).join(", ");
      const timeStr = order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";

      return `
        <tr>
          <td><strong class="order-code">${order.orderNumber || order.id.slice(0, 8)}</strong></td>
          <td>
            <div class="table-badge">${order.tableNumber || 'N/A'}</div>
          </td>
          <td>
            <div class="customer-info">
              <span class="customer-name">${order.customerName || 'Anonymous'}</span>
              <a href="tel:${order.phone}" class="customer-phone">${order.phone || ''}</a>
            </div>
          </td>
          <td class="order-summary-cell" title="${itemsSummary}">${itemsSummary || 'No items'}</td>
          <td class="font-bold text-gold">Rs. ${(order.total || 0).toLocaleString()}</td>
          <td>
            <select class="status-select status-${(order.status || 'pending').toLowerCase()}" data-order-id="${order.id}">
              <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
              <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
              <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <button type="button" class="btn-icon btn-delete-order" data-order-id="${order.id}" title="Delete order">🗑️</button>
          </td>
        </tr>
      `;
    }).join("");

    // Bind order status select changes
    tbody.querySelectorAll(".status-select").forEach(select => {
      select.addEventListener("change", async (e) => {
        const orderId = e.target.dataset.orderId;
        const newStatus = e.target.value;
        try {
          await updateDoc(doc(db, "orders", orderId), { status: newStatus });
          console.log(`Updated order ${orderId} to ${newStatus}`);
        } catch (err) {
          alert("Error updating status: " + err.message);
        }
      });
    });

    // Bind delete order
    tbody.querySelectorAll(".btn-delete-order").forEach(btn => {
      btn.addEventListener("click", async () => {
        const orderId = btn.dataset.orderId;
        if (!confirm("Are you sure you want to permanently delete this order record?")) return;
        try {
          await deleteDoc(doc(db, "orders", orderId));
        } catch (err) {
          alert("Error deleting order: " + err.message);
        }
      });
    });
  }

  renderMenuItemsTable() {
    const tbody = document.getElementById("menuItemsTableBody");
    if (!tbody) return;

    if (this.menuItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-muted">No menu items found. Click 'Seed 50+ Dishes' or 'Add Dish'.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.menuItems.map(item => {
      return `
        <tr>
          <td>
            <img src="${item.image}" alt="${item.nameEn}" class="admin-thumb" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&q=80'" />
          </td>
          <td>
            <div class="admin-dish-names">
              <strong>${item.nameEn}</strong>
              <small class="ur-sub">${item.nameUr || ''}</small>
            </div>
          </td>
          <td><span class="category-tag">${item.category}</span></td>
          <td><strong>Rs. ${Number(item.price).toLocaleString()}</strong></td>
          <td>
            <button type="button" class="btn-toggle-avail ${item.available ? 'is-avail' : 'is-unavail'}" data-dish-id="${item.id}" data-current="${item.available}">
              ${item.available ? 'Available' : 'Sold Out'}
            </button>
          </td>
          <td>
            <div class="btn-group-sm">
              <button type="button" class="btn-sm btn-edit-dish" data-dish-id="${item.id}">Edit</button>
              <button type="button" class="btn-sm btn-delete-dish" data-dish-id="${item.id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Availability toggle
    tbody.querySelectorAll(".btn-toggle-avail").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.dishId;
        const current = btn.dataset.current === "true";
        try {
          await updateDoc(doc(db, "menuItems", id), { available: !current });
        } catch (err) {
          alert("Error updating availability: " + err.message);
        }
      });
    });

    // Edit dish
    tbody.querySelectorAll(".btn-edit-dish").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.dishId;
        const item = this.menuItems.find(m => m.id === id);
        if (item) this.openDishModal(item);
      });
    });

    // Delete dish
    tbody.querySelectorAll(".btn-delete-dish").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.dishId;
        if (!confirm("Are you sure you want to delete this menu dish?")) return;
        try {
          await deleteDoc(doc(db, "menuItems", id));
        } catch (err) {
          alert("Error deleting item: " + err.message);
        }
      });
    });
  }

  bindMenuModal() {
    const modal = document.getElementById("dishModal");
    const openAddBtn = document.getElementById("btnAddNewDish");
    const form = document.getElementById("dishEditForm");

    if (openAddBtn) {
      openAddBtn.addEventListener("click", () => {
        this.openDishModal(null);
      });
    }

    if (modal) {
      modal.querySelectorAll("[data-close-dish-modal]").forEach(btn => {
        btn.addEventListener("click", () => {
          modal.classList.remove("active");
        });
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector("button[type='submit']");
        submitBtn.disabled = true;

        const dishId = form.dishId.value || `dish-${Date.now()}`;
        const payload = {
          nameEn: form.nameEn.value.trim(),
          nameUr: form.nameUr.value.trim(),
          namePs: form.namePs.value.trim(),
          descriptionEn: form.descriptionEn.value.trim(),
          descriptionUr: form.descriptionUr.value.trim(),
          descriptionPs: form.descriptionPs.value.trim(),
          price: Number(form.price.value),
          category: form.category.value,
          image: form.image.value.trim() || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
          available: form.available.checked,
          updatedAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, "menuItems", dishId), payload, { merge: true });
          modal.classList.remove("active");
          form.reset();
        } catch (err) {
          alert("Error saving dish: " + err.message);
        } finally {
          submitBtn.disabled = false;
        }
      });
    }
  }

  openDishModal(item = null) {
    const modal = document.getElementById("dishModal");
    const form = document.getElementById("dishEditForm");
    const title = document.getElementById("dishModalTitle");
    if (!modal || !form) return;

    if (item) {
      title.textContent = `Edit Dish: ${item.nameEn}`;
      form.dishId.value = item.id;
      form.nameEn.value = item.nameEn || "";
      form.nameUr.value = item.nameUr || "";
      form.namePs.value = item.namePs || "";
      form.price.value = item.price || "";
      form.category.value = item.category || "karahi";
      form.image.value = item.image || "";
      form.descriptionEn.value = item.descriptionEn || "";
      form.descriptionUr.value = item.descriptionUr || "";
      form.descriptionPs.value = item.descriptionPs || "";
      form.available.checked = item.available !== false;
    } else {
      title.textContent = "Add New Dish";
      form.reset();
      form.dishId.value = "";
      form.available.checked = true;
    }

    modal.classList.add("active");
  }

  async loadRestaurantSettings() {
    try {
      const snap = await getDoc(doc(db, "settings", "general"));
      const data = snap.exists() ? snap.data() : INITIAL_SETTINGS;

      const form = document.getElementById("restaurantSettingsForm");
      if (form) {
        form.hotelName.value = data.hotelName || "Sharjah Hotel Yaru";
        form.phone.value = data.phone || "0301 6372561";
        form.location.value = data.location || "Yaru, Pishin, Balochistan, Pakistan";
        form.openingHours.value = data.openingHours || "Open";
        form.closingHours.value = data.closingHours || "Closes at 2:00 AM";
        form.priceRange.value = data.priceRange || "Rs. 2,000–3,000";
        form.services.value = (data.services || []).join(", ");
      }
    } catch (e) {
      console.warn("Could not load settings:", e);
    }
  }

  bindSettingsForm() {
    const form = document.getElementById("restaurantSettingsForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector("button[type='submit']");
      submitBtn.disabled = true;

      const payload = {
        hotelName: form.hotelName.value.trim(),
        phone: form.phone.value.trim(),
        location: form.location.value.trim(),
        openingHours: form.openingHours.value.trim(),
        closingHours: form.closingHours.value.trim(),
        priceRange: form.priceRange.value.trim(),
        services: form.services.value.split(",").map(s => s.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, "settings", "general"), payload, { merge: true });
        alert("Settings saved successfully!");
      } catch (err) {
        alert("Error saving settings: " + err.message);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  renderQRCodeSection() {
    const container = document.getElementById("adminQrPreviewContainer");
    if (container) {
      renderMenuQRCode(container, null, 280);
    }
    const urlDisplay = document.getElementById("qrTargetUrlDisplay");
    if (urlDisplay) {
      urlDisplay.textContent = getProductionMenuUrl();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".admin-dashboard-container")) {
    window.adminDashboard = new AdminDashboard();
  }
});
