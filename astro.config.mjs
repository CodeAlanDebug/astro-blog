// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

import icon from "astro-icon";

import decapCmsOauth from "astro-decap-cms-oauth";

// https://astro.build/config
export default defineConfig({
  site: "https://alan.one",
  integrations: [
    mdx(),
    sitemap(),
    icon(),
    // Blog editor at /admin (Sveltia CMS UI) with self-hosted GitHub OAuth
    // at /oauth + /oauth/callback, served by the same Cloudflare Worker.
    decapCmsOauth({
      decapCMSSrcUrl: "https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js",
    }),
  ],
  adapter: cloudflare(),
  // Enable CSRF protection but allow requests from development and production origins
  security: {
    checkOrigin: true,
  },
});