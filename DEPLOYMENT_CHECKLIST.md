# Deployment Checklist

Use this checklist to deploy the contact form worker integration step by step.

## Pre-Deployment

- [ ] Node.js and npm installed
- [ ] Wrangler CLI installed (`npm install -g wrangler` or use `npx`)
- [ ] Cloudflare account created
- [ ] Domain access for DNS configuration
- [ ] Authenticated with Wrangler (`wrangler login`)

## Step 1: Configure Email Addresses

- [ ] Edit `workers/contact-form.js`
- [ ] Update `RECIPIENT_EMAIL` (where to receive messages)
- [ ] Update `RECIPIENT_NAME`
- [ ] Update `SENDER_EMAIL` (must use your domain)
- [ ] Update `SENDER_NAME`
- [ ] Save changes

## Step 2: Deploy the Worker

```bash
npm run deploy:worker
```

- [ ] Worker deployed successfully
- [ ] Note your worker URL (e.g., `https://contact-form-worker.XXX.workers.dev`)
- [ ] Test worker URL is accessible

## Step 3: Configure DNS Records

Add this TXT record to your domain:

```
Type: TXT
Name: @ (or root domain)
Value: v=spf1 a mx include:relay.mailchannels.net ~all
```

- [ ] DNS record added
- [ ] Wait 5-30 minutes for propagation
- [ ] Verify with `dig TXT your-domain.com`

**Optional but recommended - DKIM Record:**
```
Type: TXT
Name: mc1._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYaJKUH6a/2M9FGKSl3bGj6Og8fWXcl+gI5MUn7VPz9p7QKQs6H6dJ6U4Q0iIaOF0pGp8g7XbqU9XvL7FaKJGz7G9LH6dS3l8QUhP9Y9dG6Xq9fK6j+gF6fU6G3+YqL7p5KfK1Qp8XqL6G3fKz1j5qK6bGp8g7XbqU9XvL7FaKJGz7QIDAQAB
```

- [ ] DKIM record added (optional)

## Step 4: Set Environment Variable

**Option A: Local .env file (for testing)**
```bash
# Create .env file
PUBLIC_CONTACT_WORKER_URL=https://contact-form-worker.XXX.workers.dev
```

- [ ] .env file created
- [ ] Worker URL set correctly

**Option B: Cloudflare Pages (for production)**
1. Go to Cloudflare Pages dashboard
2. Select your project
3. Settings → Environment variables
4. Add production variable:
   - Name: `PUBLIC_CONTACT_WORKER_URL`
   - Value: `https://contact-form-worker.XXX.workers.dev`

- [ ] Environment variable set in Cloudflare Pages
- [ ] Variable set for production environment

## Step 5: Update CORS Origins (if needed)

If deploying to a custom domain:

- [ ] Edit `workers/contact-form.js`
- [ ] Add your domain to `ALLOWED_ORIGINS`
- [ ] Redeploy worker: `npm run deploy:worker`

## Step 6: Build and Deploy Site

```bash
npm run build
npm run deploy
```

- [ ] Build successful
- [ ] Site deployed
- [ ] Note deployment URL

## Step 7: Test the Integration

### Test 1: Worker Direct Test
```bash
curl -X POST https://your-worker-url.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message","subject":"Test"}'
```

- [ ] Returns 200 OK
- [ ] Response shows `"success": true`

### Test 2: Form Submission
1. Visit your contact page
2. Fill out the form with valid data
3. Submit

- [ ] Form submits successfully
- [ ] Success message appears
- [ ] No console errors

### Test 3: Email Delivery
- [ ] Check recipient email inbox
- [ ] Email received from contact form
- [ ] Email content is correct and formatted
- [ ] Reply-to address is the form submitter

### Test 4: Validation
Submit form with:
- Empty name
- Invalid email
- Short message

- [ ] Validation errors appear
- [ ] Form doesn't submit
- [ ] Error messages are clear

### Test 5: Spam Protection
Fill out the honeypot field and submit

- [ ] Submission rejected
- [ ] Spam detection working

## Step 8: Monitor Logs

```bash
wrangler tail --config wrangler-worker.toml
```

- [ ] Can view worker logs
- [ ] No error messages in logs
- [ ] Form submissions logged correctly

## Optional Enhancements

### Custom Route (Cleaner URL)

Edit `wrangler-worker.toml`:
```toml
routes = [
  { pattern = "your-domain.com/api/contact-worker", zone_name = "your-domain.com" }
]
```

- [ ] Route configured
- [ ] Worker redeployed
- [ ] Update `PUBLIC_CONTACT_WORKER_URL` to custom route
- [ ] Site rebuilt and deployed

### Environment-Based Configuration

For staging/production separation:

- [ ] Create separate worker for staging
- [ ] Use different environment variables
- [ ] Test both environments

## Troubleshooting

### Emails Not Sending

If emails aren't being delivered:

- [ ] Verify DNS SPF record with `dig TXT your-domain.com`
- [ ] Check worker logs for errors
- [ ] Verify RECIPIENT_EMAIL is correct
- [ ] Wait 30 minutes for DNS propagation
- [ ] Test MailChannels API directly

### CORS Errors

If getting CORS errors:

- [ ] Verify your domain is in `ALLOWED_ORIGINS`
- [ ] Check browser console for specific error
- [ ] Redeploy worker after CORS changes
- [ ] Clear browser cache

### Form Not Submitting

If form doesn't submit:

- [ ] Check browser console for JavaScript errors
- [ ] Verify `PUBLIC_CONTACT_WORKER_URL` is set correctly
- [ ] Test worker URL directly with curl
- [ ] Check network tab in browser dev tools
- [ ] Verify build includes latest changes

### Worker Deployment Fails

If worker won't deploy:

- [ ] Run `wrangler login` to authenticate
- [ ] Check `wrangler whoami` to verify account
- [ ] Run dry-run: `wrangler deploy --config wrangler-worker.toml --dry-run`
- [ ] Check for syntax errors
- [ ] Verify wrangler version is recent

## Post-Deployment

- [ ] Document worker URL for team
- [ ] Set up monitoring/alerts (optional)
- [ ] Add to backup procedures
- [ ] Update team documentation
- [ ] Test form monthly to ensure it still works

## Rollback Plan

If something goes wrong:

### Quick Rollback (Use Default API)
1. Remove `PUBLIC_CONTACT_WORKER_URL` environment variable
2. Rebuild and redeploy site
3. Form will use `/api/contact` endpoint

- [ ] Know how to rollback quickly

### Restore Previous Worker
```bash
# List deployments
wrangler deployments list --config wrangler-worker.toml

# Rollback to previous
wrangler rollback [deployment-id] --config wrangler-worker.toml
```

- [ ] Understand rollback process

## Success Criteria

✅ Worker deployed and accessible  
✅ DNS records configured  
✅ Form submits successfully  
✅ Emails arrive at recipient  
✅ Validation working correctly  
✅ No console errors  
✅ Spam protection active  
✅ Logs accessible  

## Maintenance

### Regular Checks (Monthly)
- [ ] Test form submission
- [ ] Verify emails are delivering
- [ ] Check worker logs for errors
- [ ] Review worker analytics
- [ ] Update dependencies if needed

### Updates
When making changes:
- [ ] Test locally first: `npm run dev:worker`
- [ ] Run unit tests: `npm run test:worker`
- [ ] Deploy to staging (if available)
- [ ] Deploy to production
- [ ] Verify with test submission

---

## Quick Reference

### Useful Commands
```bash
# Deploy worker
npm run deploy:worker

# View logs
wrangler tail --config wrangler-worker.toml

# Test worker
npm run test:worker

# Deploy site
npm run build && npm run deploy

# Check DNS
dig TXT your-domain.com

# Test worker directly
curl -X POST your-worker-url -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

### Important URLs
- Worker Dashboard: https://dash.cloudflare.com → Workers & Pages
- DNS Settings: https://dash.cloudflare.com → Your Domain → DNS
- Pages Settings: https://dash.cloudflare.com → Pages → Your Project

---

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Worker URL**: _________________  
**Site URL**: _________________  

**Status**: ⬜ Pre-deployment ⬜ In Progress ⬜ Complete ⬜ Verified
