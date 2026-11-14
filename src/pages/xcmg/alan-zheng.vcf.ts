import type { APIRoute } from "astro";
import { card, fullName } from "../../data/xcmgCard";

export const prerender = true;

// RFC 2426 (vCard 3.0) text escaping. 3.0 rather than 4.0 because it is
// the version both iOS Contacts and Android/Google Contacts import cleanly.
const esc = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

export const GET: APIRoute = ({ site }) => {
  const pageUrl = new URL(card.path, site).href;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(card.familyName)};${esc(card.givenName)};;;`,
    `FN:${esc(fullName)}`,
    `ORG:${esc(card.org)}`,
    `TITLE:${esc(card.title)}`,
    card.phone ? `TEL;TYPE=CELL,VOICE:${card.phone}` : null,
    `EMAIL;TYPE=INTERNET,WORK:${card.email}`,
    `URL:${pageUrl}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${card.linkedin}`,
    "END:VCARD",
  ].filter(Boolean);

  // vCard requires CRLF line endings.
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/vcard; charset=utf-8" },
  });
};
