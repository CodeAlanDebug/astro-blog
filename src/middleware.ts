import { defineMiddleware } from "astro:middleware";

// alan.zheng.dev is the single public identity. The older domains point at the
// same Worker, so consolidate them here rather than serving duplicate content.
const CANONICAL_HOST = "alan.zheng.dev";
const REDIRECT_HOSTS = new Set([
  "alan.one",
  "www.alan.one",
  "codealan.com",
  "www.codealan.com",
]);

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);

  if (REDIRECT_HOSTS.has(url.hostname)) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return context.redirect(url.toString(), 301);
  }

  return next();
});
