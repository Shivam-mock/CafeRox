/* ============================================================
   CAFE ROX — ADMIN SETTINGS
   ============================================================
   Change YOUR cafe's details here. Nothing else in the project
   needs to be touched for these changes to take effect.

   This is the single source of truth for:
     - Cafe identity (name, tagline, logo)
     - Hero section text
     - Contact & location info
     - WhatsApp ordering number
     - Currency, delivery charge, and tax
     - Social media links

   NOTE: whatsappNumber must be in international format with
   NO "+", spaces, or dashes. Example for India: "919876543210"
   ============================================================ */

const CAFE_SETTINGS = {

  /* ---------- Identity ---------- */
  cafeName: "Cafe Rox",
  tagline: "Good Coffee, Good Mood",
  logo: "images/logo/logo.svg",

  /* ---------- Hero Section ---------- */
  heroEyebrow: "Welcome To",
  heroTitle: "CAFE ROX",
  heroSubtitle: "Sip • Relax • Enjoy",
  heroBackground: "images/hero/hero-bg.svg",

  /* ---------- Contact & Location ---------- */
  phone: "+91 8382984205",
  address: "123 Coffee Street, Hazratganj, Lucknow, India",
  email: "hello@caferox.com",

  /* ---------- WhatsApp Ordering ----------
     This number receives every order placed on the site. */
  whatsappNumber: "918382984205",

  /* ---------- Pricing Rules ---------- */
  currencySymbol: "₹",
  deliveryCharge: 20,     // flat delivery fee added to every order
  taxPercent: 5,          // percentage tax applied to item subtotal
  freeDeliveryAbove: 300, // order value above which delivery is free (0 = never free)

  /* ---------- Social Links ----------
     Leave a value as "#" to hide/disable that icon. */
  socialLinks: {
    facebook: "#",
    instagram: "#",
    whatsapp: "#",
  },

  /* ---------- Footer ---------- */
  footerNote: "Made with love, one cup at a time.",
  copyrightYear: 2026,
};
