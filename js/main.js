/**
 * Core Site Interactivity & UI Enhancements for Sharjah Hotel Yaru
 * Handles mobile hamburger nav, sticky header, lightbox viewer,
 * click-to-call, and toast alerts.
 */
import { getCurrentLanguage, setLanguage, applyLanguage } from "./language.js";
import { cart } from "./cart.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Mobile Menu Drawer Toggle
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mobileNavMenu = document.getElementById("mobileNavMenu");
  const mobileNavOverlay = document.getElementById("mobileNavOverlay");

  if (mobileMenuToggle && mobileNavMenu) {
    const toggleNav = () => {
      mobileNavMenu.classList.toggle("open");
      if (mobileNavOverlay) mobileNavOverlay.classList.toggle("open");
      const isOpen = mobileNavMenu.classList.contains("open");
      mobileMenuToggle.setAttribute("aria-expanded", isOpen);
    };

    mobileMenuToggle.addEventListener("click", toggleNav);
    if (mobileNavOverlay) mobileNavOverlay.addEventListener("click", toggleNav);

    // Close when clicking links
    mobileNavMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileNavMenu.classList.remove("open");
        if (mobileNavOverlay) mobileNavOverlay.classList.remove("open");
      });
    });
  }

  // 2. Header elevation on scroll
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        header.classList.add("header-scrolled");
      } else {
        header.classList.remove("header-scrolled");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // 3. Lightbox viewer for Gallery
  const lightbox = document.getElementById("galleryLightbox");
  const lightboxImg = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  if (lightbox && lightboxImg) {
    document.querySelectorAll(".gallery-item-clickable").forEach(item => {
      item.addEventListener("click", () => {
        const fullSrc = item.getAttribute("data-full-image") || item.querySelector("img")?.src;
        const caption = item.getAttribute("data-caption") || item.querySelector("img")?.alt || "Sharjah Hotel Yaru";

        lightboxImg.src = fullSrc;
        if (lightboxCaption) lightboxCaption.textContent = caption;
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    const closeBox = () => {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    };

    if (lightboxClose) lightboxClose.addEventListener("click", closeBox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeBox();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("active")) {
        closeBox();
      }
    });
  }

  // 4. Highlight active nav link based on current page
  const currentPath = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href && (currentPath.endsWith(href) || (currentPath === "/" && href === "index.html"))) {
      link.classList.add("active");
    }
  });
});
