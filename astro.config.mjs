// @ts-check
import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

import icon from "astro-icon";

import decapCmsOauth from "astro-decap-cms-oauth";

// Astro accepts a single canonical `site` URL.
// Use SITE_URL to switch between domains per environment.
const siteUrl = process.env.SITE_URL ?? "https://codealan.com";

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  integrations: [
    mdx(),
    sitemap(),
    icon(),
    // Blog editor at /admin (Sveltia CMS UI). OAuth routes are implemented
    // in src/pages/oauth/ instead of the integration's own, so sign-in can
    // be restricted to the site owner's GitHub account.
    decapCmsOauth({
      decapCMSSrcUrl: "https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js",
      oauthDisabled: true,
    }),
  ],
  env: {
    validateSecrets: true,
    schema: {
      OAUTH_GITHUB_CLIENT_ID: envField.string({
        context: "server",
        access: "secret",
      }),
      OAUTH_GITHUB_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  adapter: cloudflare(),
  // Enable CSRF protection but allow requests from development and production origins
  security: {
    checkOrigin: true,
  },
});
