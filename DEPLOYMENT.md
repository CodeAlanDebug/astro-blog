# Deployment Guide

This project uses GitHub Actions to automatically build and deploy to Cloudflare Workers whenever changes are pushed to the main branch.

## Prerequisites

Before the automated deployment can work, you need to set up the following:

### 1. Cloudflare API Token

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use the **Edit Cloudflare Workers** template or create a custom token with:
   - Permissions: `Account` → `Cloudflare Workers Scripts` → `Edit`
   - Account Resources: Include your specific account
5. Create the token and **copy it** (you won't be able to see it again)

### 2. Cloudflare Account ID

1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select **Workers & Pages**
3. On the right sidebar, find your **Account ID**
4. Copy the Account ID

### 3. Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: Paste your Cloudflare API Token from step 1

4. Click **New repository secret** again and add:
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Value**: Paste your Cloudflare Account ID from step 2

## How It Works

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:

### Triggers

The deployment workflow runs when:

1. **Code is pushed** to `main` or `master` branch
2. **Blog posts are updated** (changes in `src/content/blog/`)
3. **Components or styles change** (changes in `src/pages/`, `src/components/`, `src/styles/`)
4. **Dependencies change** (`package.json` or `astro.config.mjs`)
5. **Manual trigger** via GitHub Actions UI
6. **Pull requests** are opened (for testing only, won't deploy)

### Workflow Steps

1. **Build and Test**
   - Checks out the code
   - Installs Node.js and dependencies
   - Runs TypeScript type checking
   - Builds the Astro site
   - Uploads build artifacts

2. **Deploy** (only on main/master branch)
   - Downloads build artifacts
   - Deploys to Cloudflare Workers using Wrangler
   - Sends deployment notifications

## Manual Deployment

If you prefer to deploy manually:

```bash
# Build the project
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

## Deployment Status

Check the deployment status:

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. You'll see all workflow runs with their status

## Troubleshooting

### Deployment Fails with Authentication Error

- Verify that `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are correctly set in GitHub Secrets
- Make sure the API token has the correct permissions
- Check that the token hasn't expired

### Build Fails with TypeScript Errors

- Run `npx tsc --noEmit` locally to see the TypeScript errors
- Fix any type errors before pushing

### Build Succeeds but Deployment Fails

- Check the Cloudflare Workers logs in your Cloudflare Dashboard
- Verify that your `wrangler.json` configuration is correct
- Ensure your Worker name doesn't conflict with existing workers

## Monitoring Deployments

After deployment:

1. Visit your Cloudflare Workers dashboard
2. Check the deployment logs
3. Test your site at the deployed URL

## Rollback

If a deployment causes issues:

1. Go to GitHub repository → **Actions**
2. Find a successful previous deployment
3. Click **Re-run jobs** to redeploy the previous version

Or manually rollback:

```bash
# Checkout the previous commit
git checkout <previous-commit-hash>

# Deploy manually
npm run build && npm run deploy
```

## Environment-Specific Configurations

For different environments (staging, production):

1. Create separate branches (e.g., `staging`, `production`)
2. Update `.github/workflows/deploy.yml` to deploy to different Workers
3. Add environment-specific secrets in GitHub

Example:

```yaml
- name: Deploy to Staging
  if: github.ref == 'refs/heads/staging'
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN_STAGING }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    environment: staging
```

## Next Steps

- Set up custom domain in Cloudflare Workers
- Configure DNS records for your domain
- Enable Cloudflare Analytics for visitor tracking
- Set up email alerts for deployment failures (GitHub Actions notifications)
