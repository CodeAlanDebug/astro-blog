// Single source of truth for the XCMG digital business card.
// Used by the page (src/pages/xcmg/index.astro) and the vCard
// (src/pages/xcmg/alan-zheng.vcf.ts), so they can never drift apart.

export const card = {
  givenName: "Alan",
  familyName: "Zheng",
  title: "International Project Coordinator",
  org: "XCMG",
  email: "gge@xcmg.com",
  // E.164, no spaces (used for tel: and the vCard), e.g. "+31612345678".
  // Leave empty to hide the phone row and omit TEL from the vCard.
  phone: "",
  // How the number is shown on the page, e.g. "+31 6 1234 5678".
  phoneDisplay: "",
  linkedin: "https://www.linkedin.com/in/alanszheng",
  path: "/xcmg/",
  vcfPath: "/xcmg/alan-zheng.vcf",
} as const;

export const fullName = `${card.givenName} ${card.familyName}`;
