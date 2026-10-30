/**
 * Shopping Cart & Table Order Checkout Engine for Sharjah Hotel Yaru
 * Handles real-time item quantities, totals, drawer animations,
 * localStorage persistence, and Firestore order submissions.
 */
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { db, handleFirestoreError, OperationType } from "./firebase-config.js";
import { getCurrentLanguage, TRANSLATIONS } from "./language.js";

const CART_STORAGE_KEY = "shy_cart_items";

class CartStore {
  constructor() {
    this.items = this.loadCart();
    this.initEventListeners();
    this.updateUI();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Could not load cart from storage:", e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.warn("Could not save cart:", e);
    }
    this.updateUI();
  }

  addItem(dish) {
    if (!dish.available) return false;

    const existingIndex = this.items.findIndex(i => i.id === dish.id);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push({
        id: dish.id,
        nameEn: dish.nameEn,
        nameUr: dish.nameUr,
        namePs: dish.namePs,
        price: Number(dish.price),
        image: dish.image,
        category: dish.category,
        quantity: 1
      });
    }

    this.saveCart();
    this.showCartToast(dish);
    this.openDrawer();
    return true;
  }

  removeItem(dishId) {
    this.items = this.items.filter(i => i.id !== dishId);
    this.saveCart();
  }

  updateQuantity(dishId, delta) {
    const item = this.items.find(i => i.id === dishId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(dishId);
    } else {
      this.saveCart();
    }
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getGrandTotal() {
    return this.getSubtotal(); // Cash only, direct total in PKR
  }

  generateOrderNumber() {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `SHY-${dateStr}-${randomSuffix}`;
  }

  async submitOrder(formData) {
    if (this.items.length === 0) {
      throw new Error("Cannot submit an empty order.");
    }

    const orderNumber = this.generateOrderNumber();
    const orderData = {
      orderNumber,
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      tableNumber: formData.tableNumber.trim(),
      instructions: formData.instructions ? formData.instructions.trim() : "",
      items: this.items.map(item => ({
        id: item.id,
        nameEn: item.nameEn,
        nameUr: item.nameUr || item.nameEn,
        namePs: item.namePs || item.nameEn,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      })),
      subtotal: this.getSubtotal(),
      total: this.getGrandTotal(),
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    try {
      const ordersRef = collection(db, "orders");
      const docRef = await addDoc(ordersRef, orderData);
      console.log("Order submitted to Firestore with ID:", docRef.id);
      
      this.clear();
      return { success: true, orderNumber, id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "orders");
      throw error;
    }
  }

  showCartToast(dish) {
    const lang = getCurrentLanguage();
    const name = lang === "ur" ? (dish.nameUr || dish.nameEn) : 
                 lang === "ps" ? (dish.namePs || dish.nameEn) : dish.nameEn;
    const toast = document.getElementById("cartToast");
    if (!toast) return;

    toast.querySelector(".toast-title").textContent = name;
    toast.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  openDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    if (drawer) drawer.classList.add("open");
    if (overlay) overlay.classList.add("open");
  }

  closeDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    if (drawer) drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
  }

  openCheckoutModal() {
    this.closeDrawer();
    const modal = document.getElementById("checkoutModal");
    if (modal) modal.classList.add("active");
  }

  closeCheckoutModal() {
    const modal = document.getElementById("checkoutModal");
    if (modal) modal.classList.remove("active");
  }

  showOrderSuccess(orderNumber) {
    const successModal = document.getElementById("orderSuccessModal");
    const orderNumEl = document.getElementById("successOrderNumber");
    if (orderNumEl) orderNumEl.textContent = orderNumber;
    if (successModal) successModal.classList.add("active");
  }

  updateUI() {
    const lang = getCurrentLanguage();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    const count = this.getItemCount();
    const subtotal = this.getSubtotal();

    // Update cart counter badges
    document.querySelectorAll(".cart-count-badge").forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    });

    // Update totals
    document.querySelectorAll(".cart-subtotal-val, .cart-total-val").forEach(el => {
      el.textContent = `Rs. ${subtotal.toLocaleString()}`;
    });

    // Render list in drawer
    const listEl = document.getElementById("cartItemsList");
    const emptyState = document.getElementById("cartEmptyState");
    const cartFooter = document.getElementById("cartFooter");

    if (listEl) {
      if (this.items.length === 0) {
        listEl.innerHTML = "";
        if (emptyState) emptyState.style.display = "flex";
        if (cartFooter) cartFooter.style.display = "none";
      } else {
        if (emptyState) emptyState.style.display = "none";
        if (cartFooter) cartFooter.style.display = "block";

        listEl.innerHTML = this.items.map(item => {
          const displayName = lang === "ur" ? (item.nameUr || item.nameEn) :
                             lang === "ps" ? (item.namePs || item.nameEn) : item.nameEn;
          return `
            <div class="cart-item" data-id="${item.id}">
              <img src="${item.image}" alt="${displayName}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&q=80'" />
              <div class="cart-item-info">
                <h4 class="cart-item-name">${displayName}</h4>
                <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
                <div class="cart-item-controls">
                  <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                  <span class="qty-number">${item.quantity}</span>
                  <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
              </div>
              <div class="cart-item-actions">
                <div class="cart-item-line-total">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
                <button type="button" class="cart-item-remove" data-action="remove" data-id="${item.id}" title="Remove item">✕</button>
              </div>
            </div>
          `;
        }).join("");
      }
    }
  }

  initEventListeners() {
    document.addEventListener("click", (e) => {
      // Toggle cart button
      if (e.target.closest("[data-toggle-cart]")) {
        e.preventDefault();
        this.openDrawer();
      }

      // Close cart drawer
      if (e.target.closest("[data-close-cart]") || e.target.id === "cartOverlay") {
        this.closeDrawer();
      }

      // Cart item quantity modifications
      const actionBtn = e.target.closest("[data-action]");
      if (actionBtn && actionBtn.closest("#cartDrawer")) {
        const action = actionBtn.dataset.action;
        const id = actionBtn.dataset.id;
        if (action === "increase") this.updateQuantity(id, 1);
        if (action === "decrease") this.updateQuantity(id, -1);
        if (action === "remove") this.removeItem(id);
      }

      // Clear cart
      if (e.target.closest("#btnClearCart")) {
        this.clear();
      }

      // Checkout button in drawer
      if (e.target.closest("#btnOpenCheckout")) {
        if (this.items.length === 0) return;
        this.openCheckoutModal();
      }

      // Close checkout modal
      if (e.target.closest("[data-close-checkout]") || (e.target.classList.contains("modal-overlay") && e.target.id === "checkoutModal")) {
        this.closeCheckoutModal();
      }

      // Close order success modal
      if (e.target.closest("[data-close-success]") || (e.target.classList.contains("modal-overlay") && e.target.id === "orderSuccessModal")) {
        const successModal = document.getElementById("orderSuccessModal");
        if (successModal) successModal.classList.remove("active");
      }
    });

    // Checkout Form Submission
    document.addEventListener("submit", async (e) => {
      if (e.target.id === "orderCheckoutForm") {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector("button[type='submit']");
        const originalText = submitBtn.innerHTML;

        const customerName = form.customerName.value;
        const phone = form.phone.value;
        const tableNumber = form.tableNumber.value;
        const instructions = form.instructions?.value || "";

        if (!customerName || !phone || !tableNumber) {
          alert("Please fill in all required fields (Name, Phone, Table Number).");
          return;
        }

        try {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Submitting Order...</span>`;

          const result = await this.submitOrder({ customerName, phone, tableNumber, instructions });
          form.reset();
          this.closeCheckoutModal();
          this.showOrderSuccess(result.orderNumber);
        } catch (err) {
          console.error("Order submission failure:", err);
          alert("Unable to submit order to database right now. Please notify restaurant staff directly: 0301 6372561");
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });

    // Listen for language changes to update localized text in cart
    window.addEventListener("languageChanged", () => {
      this.updateUI();
    });
  }
}

export const cart = new CartStore();
