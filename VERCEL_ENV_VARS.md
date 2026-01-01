# Vercel Environment Variables

Add these environment variables in your Vercel project settings:

## Required Environment Variables

### Database
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
```
- Get from Supabase Dashboard → Settings → Database → Connection string

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
- Get from Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep secret!)

### Anthropic AI
```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```
- Get from https://console.anthropic.com/
- Used for: AI image analysis, listing generation, pricing, questions

### Cloudflare R2 (Image Storage)
```
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY=your_access_key
CLOUDFLARE_R2_SECRET_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=flippin-images
NEXT_PUBLIC_R2_PUBLIC_URL=https://your_account_id.r2.cloudflarestorage.com/flippin-images
```
- Get from Cloudflare Dashboard → R2
- Can be set up later if needed

### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```
- `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL (or custom domain)
- `NODE_ENV`: Set to `production` for Vercel

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**

## Important Notes

- ✅ All `NEXT_PUBLIC_*` variables are exposed to the browser
- ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` secret
- ✅ `NEXT_PUBLIC_APP_URL` should be your production URL after first deployment
- ✅ You can update `NEXT_PUBLIC_APP_URL` after deployment to use the actual Vercel URL

## Optional: Email Service (Resend)

If you want to send real emails (currently logs to console):
```
RESEND_API_KEY=re_your_key_here
```
- Get from https://resend.com/
- Currently emails are logged to console, but ready for Resend integration

