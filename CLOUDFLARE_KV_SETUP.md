# Cloudflare KV Setup for Sessions

If your deployment fails with an error about the SESSION KV binding, follow these steps:

## Option 1: Create SESSION KV Namespace (Recommended if you need sessions)

### 1. Create KV Namespace in Cloudflare

```bash
# Using wrangler CLI
npx wrangler kv namespace create SESSION
```

This will output something like:
```
✨ Success!
Add the following to your wrangler.json:
{ binding = "SESSION", id = "abc123..." }
```

### 2. Update wrangler.json

Add the KV namespace binding to your `wrangler.json`:

```json
{
  "name": "astro-blog-starter",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": "./dist/_worker.js",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS"
  },
  "kv_namespaces": [
    {
      "binding": "SESSION",
      "id": "YOUR_KV_NAMESPACE_ID_HERE"
    }
  ],
  "observability": {
    "enabled": true
  },
  "upload_source_maps": true
}
```

Replace `YOUR_KV_NAMESPACE_ID_HERE` with the actual ID from step 1.

## Option 2: Disable Sessions (If you don't need them)

If you don't need server-side sessions, you can try deploying without the KV binding. The current configuration should work for most static sites with API routes.

## Troubleshooting

### If deployment still fails:

1. **Check Cloudflare API Token Permissions**:
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Verify your token has these permissions:
     - `Account` → `Cloudflare Workers Scripts` → `Edit`
     - `Account` → `Workers KV Storage` → `Edit` (if using KV)

2. **Verify GitHub Secrets**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Confirm `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set correctly

3. **Check Worker Name**:
   - The worker name in `wrangler.json` is `astro-blog-starter`
   - If a worker with this name already exists in your account, it will try to update it
   - Make sure you have permission to update that worker

4. **View Detailed Error Logs**:
   - Go to your GitHub repository → Actions tab
   - Click on the failed workflow run
   - Expand the "Deploy to Cloudflare Workers" step to see detailed error messages

## Testing Locally

Before pushing to GitHub, you can test the deployment configuration locally:

```bash
# Build the project
npm run build

# Test with dry-run (doesn't actually deploy)
npx wrangler deploy --dry-run

# If you have credentials configured locally, do a real deployment
npx wrangler deploy
```

## Common Errors

### "Invalid binding `SESSION`"
- This means the SESSION KV namespace doesn't exist
- Follow Option 1 above to create it

### "Authentication error" or "Unauthorized"
- Check your API token and account ID
- Verify the token hasn't expired
- Ensure the token has correct permissions

### "Worker name already exists"
- The worker name is taken by another project
- Either use a different name in `wrangler.json` or delete the existing worker

## Need Help?

If you're still having issues:
1. Check the GitHub Actions logs for the specific error message
2. Review the Cloudflare Workers dashboard for deployment logs
3. Consult the [Astro Cloudflare adapter docs](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
4. Check the [Wrangler documentation](https://developers.cloudflare.com/workers/wrangler/)
