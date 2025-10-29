# Quick Start Guide - Contact Form Worker Integration

This guide will help you quickly deploy and configure the contact form worker.

## ⚡ Quick Deploy (5 minutes)

### Step 1: Deploy the Worker

```bash
npm run deploy:worker
```

This will deploy your worker and give you a URL like:  
`https://contact-form-worker.YOUR-SUBDOMAIN.workers.dev`

### Step 2: Configure DNS for Email

Add this TXT record to your domain (required for MailChannels):

```
Type: TXT
Name: @
Value: v=spf1 a mx include:relay.mailchannels.net ~all
```

### Step 3: Set Environment Variable

**For Cloudflare Pages:**
1. Go to your Cloudflare Pages project
2. Settings → Environment variables
3. Add: `PUBLIC_CONTACT_WORKER_URL` = `YOUR_WORKER_URL`

**Or create `.env` file:**
```bash
PUBLIC_CONTACT_WORKER_URL=https://contact-form-worker.YOUR-SUBDOMAIN.workers.dev
```

### Step 4: Update Email Addresses (Optional)

Edit `workers/contact-form.js`:

```javascript
const CONFIG = {
  RECIPIENT_EMAIL: 'your-email@alan.one',
  SENDER_EMAIL: 'noreply@alan.one',
  // ...
};
```

Redeploy: `npm run deploy:worker`

### Step 5: Deploy Your Site

```bash
npm run build
npm run deploy
```

### Step 6: Test

Visit your contact page and submit a test message!

---

## 🧪 Testing

### Test Worker Locally

```bash
# Terminal 1: Start worker
npm run dev:worker

# Terminal 2: Run tests
npm run test:worker:integration
```

### Test Worker Code

```bash
npm run test:worker
```

---

## 📋 Available Commands

```bash
# Deploy the contact form worker
npm run deploy:worker

# Start worker in development mode
npm run dev:worker

# Run unit tests
npm run test:worker

# Run integration tests (requires running worker)
npm run test:worker:integration

# Deploy main Astro site
npm run build
npm run deploy
```

---

## 🔧 Troubleshooting

### Emails not sending?

1. **Check DNS**: `dig TXT your-domain.com` should show SPF record
2. **Check logs**: `wrangler tail --config wrangler-worker.toml`
3. **Wait for DNS**: DNS records can take 5-30 minutes to propagate

### CORS errors?

1. Ensure your domain is in `ALLOWED_ORIGINS` in `workers/contact-form.js`
2. Redeploy worker after changes

### Form not submitting?

1. Check browser console for errors
2. Verify `PUBLIC_CONTACT_WORKER_URL` is set correctly
3. Test worker directly: `curl -X POST YOUR_WORKER_URL -d '{"name":"Test","email":"test@example.com","message":"Test"}'`

---

## 📖 Full Documentation

- **Workers README**: [workers/README.md](workers/README.md)
- **Integration Guide**: [WORKER_INTEGRATION.md](WORKER_INTEGRATION.md)
- **Cloudflare Setup**: [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)

---

## 💡 Tips

1. **Custom Route**: For cleaner URLs, add a route in `wrangler-worker.toml`:
   ```toml
   routes = [{ pattern = "your-domain.com/api/contact-worker", zone_name = "your-domain.com" }]
   ```

2. **Environment Secrets**: For production, use Wrangler secrets:
   ```bash
   wrangler secret put RECIPIENT_EMAIL --config wrangler-worker.toml
   ```

3. **Multiple Environments**: Create separate configs for staging/production

---

## ✅ Verification Checklist

- [ ] Worker deployed successfully
- [ ] DNS SPF record added
- [ ] Environment variable set
- [ ] Email addresses configured
- [ ] Site rebuilt and deployed
- [ ] Test submission successful
- [ ] Email received

---

## 🎯 Using the Default API Endpoint Instead

If you prefer not to use a standalone worker:

1. Don't set `PUBLIC_CONTACT_WORKER_URL`
2. The form will automatically use `/api/contact`
3. Configure email in `src/pages/api/contact.ts`
4. Deploy normally with `npm run deploy`

---

## 🆘 Need Help?

See the full documentation or check:
- Worker logs: `wrangler tail --config wrangler-worker.toml`
- Browser console for client-side errors
- Network tab for request/response details
