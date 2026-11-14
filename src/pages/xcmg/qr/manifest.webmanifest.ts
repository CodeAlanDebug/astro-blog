import type { APIRoute } from "astro";
import { brand, card, fullName } from "../../../data/xcmgCard";

export const prerender = true;

// Lets "Add to Home Screen" launch the QR page full-screen, without
// browser chrome, like an app.
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: `${fullName} · ${card.org} QR`,
      short_name: "XCMG QR",
      start_url: `${card.path}qr/`,
      scope: `${card.path}qr/`,
      display: "standalone",
      orientation: "portrait",
      background_color: brand.primary,
      theme_color: brand.primary,
      icons: [
        {
          src: `${card.path}qr/apple-touch-icon.png`,
          sizes: "180x180",
          type: "image/png",
        },
        {
          src: `${card.path}qr/icon-512.png`,
          sizes: "512x512",
          type: "image/png",
        },
      ],
    }),
    { headers: { "Content-Type": "application/manifest+json" } }
  );
