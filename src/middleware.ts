import { defineMiddleware } from "astro:middleware";

// alan.one is the single public identity. codealan.com points at the same
// Worker, so consolidate it here rather than serving duplicate content.
const CANONICAL_HOST = "alan.one";
const REDIRECT_HOSTS = new Set(["codealan.com", "www.codealan.com"]);

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
