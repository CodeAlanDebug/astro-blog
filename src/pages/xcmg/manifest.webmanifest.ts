import type { APIRoute } from "astro";
import { brand, card, fullName } from "../../data/xcmgCard";

export const prerender = true;

// "Add to Home Screen" on the card opens it full-screen like an app.
// Scope covers /xcmg/qr/ too, so "Show QR code" stays inside the app.
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: `${fullName} · ${card.org}`,
      short_name: `${card.givenName} · ${card.org}`,
      start_url: card.path,
      scope: card.path,
      display: "standalone",
      orientation: "portrait",
      background_color: brand.primary,
      theme_color: brand.primary,
      icons: [
        {
          src: `${card.path}apple-touch-icon.png`,
          sizes: "180x180",
          type: "image/png",
        },
        {
          src: `${card.path}icon-512.png`,
          sizes: "512x512",
          type: "image/png",
        },
      ],
    }),
    { headers: { "Content-Type": "application/manifest+json" } }
  );
