// Single source of truth for the XCMG digital business card.
// Used by the card page (src/pages/xcmg/index.astro), the vCard
// (src/pages/xcmg/alan-zheng.vcf.ts) and the QR display page
// (src/pages/xcmg/qr/index.astro), so they can never drift apart.

export const card = {
  givenName: "Alan",
  familyName: "Zheng",
  title: "International Project Coordinator",
  org: "XCMG",
  email: "gge@xcmg.com",
  // E.164, no spaces (used for tel: and the vCard).
  // Leave empty to hide the phone row and omit TEL from the vCard.
  phone: "+31616921520",
  // How the number is shown on the page.
  phoneDisplay: "+31 6 1692 1520",
  linkedin: "https://www.linkedin.com/in/alanszheng",
  path: "/xcmg/",
  vcfPath: "/xcmg/alan-zheng.vcf",
  // What the QR code encodes. xcmg.alan.one is a Cloudflare Single Redirect
  // (alan.one zone) to https://alan.zheng.dev/xcmg/, so the target can move
  // without re-issuing the QR code. Lower-case keeps it in byte mode, which
  // every scanner handles; at ECC level M it fits a 25x25 (version 2) code.
  qrUrl: "https://xcmg.alan.one",
} as const;

export const fullName = `${card.givenName} ${card.familyName}`;

// XCMG corporate blue. No public brand manual exists; this is the navy of
// the XCMG logo's "X" as sampled by third-party logo analysis (~#003277).
// Swap for the official value if Corporate Communications provides one.
export const brand = {
  navy: "#003277",
  navyDeep: "#00224f",
  blueBright: "#2f74d9",
} as const;
