// Skip husky hook installation in CI and production installs,
// where husky may not be present (devDependencies omitted).
if (process.env.CI === "true" || process.env.NODE_ENV === "production") {
  process.exit(0);
}
try {
  const husky = (await import("husky")).default;
  console.log(husky());
} catch {
  // husky not installed (e.g. npm ci --omit=dev) — nothing to set up
}
