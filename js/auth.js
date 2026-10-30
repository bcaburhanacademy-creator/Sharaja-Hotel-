/**
 * Firebase Authentication & Admin Access Guard for Sharjah Hotel Yaru
 * Supports Google Sign-In and Email/Password with session observer and route protection.
 */
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

// Bootstrapped authorized administrator emails
export const AUTHORIZED_ADMIN_EMAILS = [
  "bcaburhanacademy@gmail.com"
];

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAdmin = false;
    this.isAuthReady = false;
    this.initObserver();
  }

  initObserver() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        this.isAdmin = await this.verifyAdminRole(user);
        console.log(`User signed in: ${user.email} (isAdmin: ${this.isAdmin})`);
      } else {
        this.isAdmin = false;
        console.log("No authenticated user.");
      }

      this.isAuthReady = true;
      this.updateAuthUI();
      window.dispatchEvent(new CustomEvent("authStateChanged", { 
        detail: { user: this.currentUser, isAdmin: this.isAdmin } 
      }));
    });
  }

  async verifyAdminRole(user) {
    if (!user || !user.email) return false;

    // Check pre-authorized root admin email
    if (AUTHORIZED_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return true;
    }

    try {
      // Check admin record in Firestore `/admins/{uid}`
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (adminDoc.exists()) {
        return true;
      }
    } catch (e) {
      console.warn("Could not check /admins collection:", e.message);
    }

    return false;
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  }

  async loginWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Email login error:", error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  updateAuthUI() {
    const userEmailEl = document.getElementById("adminUserEmail");
    const userRoleEl = document.getElementById("adminUserRole");
    const loginPrompt = document.getElementById("adminLoginPrompt");
    const adminMain = document.getElementById("adminMainDashboard");
    const unauthorizedNotice = document.getElementById("adminUnauthorizedNotice");

    if (userEmailEl && this.currentUser) {
      userEmailEl.textContent = this.currentUser.email || "Authorized Admin";
    }

    if (userRoleEl) {
      userRoleEl.textContent = this.isAdmin ? "Super Administrator" : "Pending Authorization";
    }

    // Protection logic for admin.html
    if (window.location.pathname.includes("admin.html")) {
      if (!this.currentUser) {
        if (loginPrompt) loginPrompt.style.display = "block";
        if (adminMain) adminMain.style.display = "none";
        if (unauthorizedNotice) unauthorizedNotice.style.display = "none";
      } else if (!this.isAdmin) {
        if (loginPrompt) loginPrompt.style.display = "none";
        if (adminMain) adminMain.style.display = "none";
        if (unauthorizedNotice) unauthorizedNotice.style.display = "block";
      } else {
        if (loginPrompt) loginPrompt.style.display = "none";
        if (adminMain) adminMain.style.display = "grid";
        if (unauthorizedNotice) unauthorizedNotice.style.display = "none";
      }
    }
  }
}

export const authService = new AuthService();
