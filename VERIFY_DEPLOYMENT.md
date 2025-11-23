# Verify Cloudflare Deployment Setup

This guide helps you verify that your Cloudflare deployment is configured correctly.

## ✅ Step 1: Verify GitHub Secrets

1. Go to your GitHub repository: `https://github.com/CodeAlanDebug/astro-blog-starter`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Verify these secrets exist:
   - ✓ `CLOUDFLARE_API_TOKEN`
   - ✓ `CLOUDFLARE_ACCOUNT_ID`

**Note:** You won't be able to see the secret values (for security), but you should see them listed.

## ✅ Step 2: Verify Cloudflare API Token Permissions

Your API token needs specific permissions:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **My Profile** → **API Tokens**
3. Find your token (or create a new one)
4. Verify it has:
   - **Account** → **Cloudflare Workers Scripts** → **Edit** ✓
   - **Account Resources** → Include your account

## ✅ Step 3: Test Deployment - Merge to Main

Once you merge this PR to `main`, the deployment will automatically trigger.

### Option A: Merge this PR

```bash
# After reviewing, merge the PR on GitHub
# Then pull the latest main branch
git checkout main
git pull origin main
```

### Option B: Test with a Blog Post

Create a test blog post to trigger deployment:

```bash
# Make sure you're on main branch
git checkout main
git pull origin main

# Create a test blog post
cat > src/content/blog/test-deployment.md << 'EOF'
---
title: 'Test Deployment'
description: 'Testing automatic Cloudflare deployment'
pubDate: 'Dec 01 2024'
---

This is a test post to verify automatic deployment works!

When I push this to GitHub, it should automatically:
1. Run type checks
2. Build the site
3. Deploy to Cloudflare Workers

Check the Actions tab to see the deployment in progress!
EOF

# Commit and push
git add src/content/blog/test-deployment.md
git commit -m "test: Add test blog post to verify deployment"
git push origin main
```

## ✅ Step 4: Monitor Deployment

1. **Go to GitHub Actions**:
   - Visit: `https://github.com/CodeAlanDebug/astro-blog-starter/actions`
   - You should see a workflow run for "Deploy to Cloudflare Workers"

2. **Check the workflow logs**:
   - Click on the running workflow
   - Expand the "Deploy to Cloudflare Workers" step
   - Look for: ✅ "Deployment successful!"

3. **Expected output**:
   ```
   ✅ Deployment successful!
   🚀 Your site has been deployed to Cloudflare Workers
   📝 Worker: astro-blog-starter
   🌐 Check your Cloudflare dashboard for the live URL
   ⏱️  Deployed at: [timestamp]
   ```

## ✅ Step 5: Find Your Live Site URL

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **Workers & Pages**
3. Find **astro-blog-starter**
4. Click on it to see your live URL

The URL will look like:
- `astro-blog-starter.yoursubdomain.workers.dev`

Or if you have a custom domain configured:
- `https://alan.one`

## ✅ Step 6: Set Up Custom Domain (Optional)

If you want to use `alan.one` as your custom domain:

1. In Cloudflare Dashboard, go to **Workers & Pages**
2. Click on **astro-blog-starter**
3. Go to **Settings** → **Domains & Routes**
4. Click **Add Custom Domain**
5. Enter: `alan.one` (or `www.alan.one`)
6. Cloudflare will automatically configure DNS

## 🔧 Troubleshooting

### Deployment fails with "Invalid API Token"

**Fix:**
1. Regenerate your Cloudflare API Token
2. Make sure it has **Workers Scripts: Edit** permission
3. Update `CLOUDFLARE_API_TOKEN` in GitHub Secrets

### Deployment fails with "Account not found"

**Fix:**
1. Go to Cloudflare Dashboard → **Workers & Pages**
2. Look for your Account ID on the right sidebar
3. Update `CLOUDFLARE_ACCOUNT_ID` in GitHub Secrets

### Workflow doesn't trigger on blog post

**Possible causes:**
1. You're not on `main` or `master` branch
2. The file is not in `src/content/blog/`
3. The file doesn't have `.md` or `.mdx` extension

**Fix:**
```bash
# Verify you're on main
git branch

# If not, switch to main
git checkout main

# Make sure blog posts are in correct location
ls src/content/blog/
```

### Build succeeds but site doesn't update

**Possible causes:**
1. Cloudflare cache not cleared
2. Browser cache

**Fix:**
- Wait 1-2 minutes for Cloudflare edge to update
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check incognito/private window

## 📊 What Triggers Deployment

Deployment automatically happens when you push to `main` branch with changes to:

| Change Type | Example | Triggers Deployment? |
|-------------|---------|---------------------|
| New blog post | Add `my-post.md` | ✅ Yes |
| Edit blog post | Update existing `.md` | ✅ Yes |
| Update component | Edit `Header.astro` | ✅ Yes |
| Update styles | Modify `global.css` | ✅ Yes |
| Update page | Change `index.astro` | ✅ Yes |
| Update config | Modify `astro.config.mjs` | ✅ Yes |
| Update dependencies | Run `npm install` | ✅ Yes |
| Edit README.md | Documentation only | ❌ No |
| Feature branch push | Not on main | ❌ No (tests only) |

## 🎯 Quick Test Checklist

- [ ] GitHub Secrets configured (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- [ ] Cloudflare API token has Workers Scripts: Edit permission
- [ ] Merged PR to main branch OR pushed blog post to main
- [ ] GitHub Actions workflow completed successfully
- [ ] Found Worker in Cloudflare Dashboard
- [ ] Visited live site URL and confirmed it works
- [ ] Tested adding a blog post and confirmed auto-deployment

## 🎉 Success!

If all steps pass, your setup is complete!

Every time you:
- Write a new blog post
- Update existing content
- Change your site code

It will **automatically deploy** to Cloudflare within 2-3 minutes! 🚀

---

Need help? Check `DEPLOYMENT.md` for detailed documentation.
