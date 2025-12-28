# Troubleshooting Guide

## Common Issues and Solutions

### 500 Error on `/api/listings/analyze`

This error typically occurs when the Anthropic API key is missing or invalid.

#### Solution for Vercel Deployment:

1. **Go to Vercel Dashboard**
   - Navigate to your project: https://vercel.com/dashboard
   - Select your `flippin` project

2. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add the following variables:

   ```
   ANTHROPIC_API_KEY=sk-ant-api03-YOUR_ACTUAL_KEY_HERE
   ```

3. **Redeploy**
   - After adding environment variables, you need to redeploy
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Select **Redeploy**

#### Verify Environment Variables:

You can check if environment variables are set by:
- Looking at the Vercel deployment logs
- Checking the function logs in Vercel dashboard
- The error message should now indicate if `ANTHROPIC_API_KEY` is missing

### 500 Error on `/api/upload`

This error occurs when Cloudflare R2 credentials are missing.

#### Required Environment Variables:

```
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY=your_access_key
CLOUDFLARE_R2_SECRET_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=flippin-images
NEXT_PUBLIC_R2_PUBLIC_URL=https://your_account_id.r2.cloudflarestorage.com/flippin-images
```

#### Solution:

1. Set up Cloudflare R2 bucket (see `README_SETUP.md`)
2. Add all R2 environment variables to Vercel
3. Redeploy the application

### Testing Locally

If you're testing locally and getting errors:

1. **Check `.env` file exists** in project root
2. **Verify all required variables are set**:
   ```bash
   # Check if ANTHROPIC_API_KEY is set
   echo $ANTHROPIC_API_KEY
   ```
3. **Restart dev server** after changing `.env`:
   ```bash
   npm run dev
   ```

### Debugging Tips

1. **Check Server Logs**
   - Vercel: Go to **Deployments** → Click on deployment → **Functions** tab
   - Local: Check terminal where `npm run dev` is running

2. **Check Browser Console**
   - Open DevTools (F12)
   - Check **Console** tab for client-side errors
   - Check **Network** tab for API request/response details

3. **Test API Endpoints Directly**
   ```bash
   # Test analyze endpoint (replace with actual image URL)
   curl -X POST https://your-app.vercel.app/api/listings/analyze \
     -H "Content-Type: application/json" \
     -d '{"imageUrls": ["https://example.com/image.jpg"]}'
   ```

### Common Error Messages

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "ANTHROPIC_API_KEY environment variable is not set" | Missing API key | Add to Vercel environment variables |
| "Failed to upload image" | R2 not configured | Set up Cloudflare R2 and add credentials |
| "Invalid JSON response from AI" | AI returned unexpected format | Try again with clearer images |
| "Rate limit exceeded" | Too many API calls | Wait a few minutes and retry |

### Still Having Issues?

1. Check the latest error logs in Vercel
2. Verify all environment variables are set correctly
3. Ensure you've redeployed after adding environment variables
4. Check that your API keys are valid and have credits/quota

