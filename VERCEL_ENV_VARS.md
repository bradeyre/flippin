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

**Where to find these keys:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. You'll see two tabs:
   - **"Publishable and secret API keys"** (new format)
   - **"Legacy anon, service_role API keys"** ← **Click this tab!**
5. In the Legacy tab, you'll find:
   - **`anon` `public`** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **`service_role` `secret`** key → Use for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)
6. `NEXT_PUBLIC_SUPABASE_URL`: Your Project URL (shown at the top of the API page)

### Anthropic AI
```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
```
- Get from https://console.anthropic.com/
- Used for: AI image analysis, listing generation, pricing, questions

### Cloudflare R2 (Image Storage) ⚠️ REQUIRED for Image Uploads
```
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY=your_access_key
CLOUDFLARE_R2_SECRET_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=flippin-images
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev/flippin-images
```

**How to set up Cloudflare R2:**
1. Go to https://dash.cloudflare.com/
2. Select your account (or create one if needed)
3. Go to **R2** → **Create bucket**
4. Name it `flippin-images` (or your preferred name)
5. Go to **Manage R2 API Tokens** → **Create API Token**
   - Permissions: **Object Read & Write**
   - TTL: Leave empty (or set expiration)
   - Copy the **Access Key ID** → `CLOUDFLARE_R2_ACCESS_KEY`
   - Copy the **Secret Access Key** → `CLOUDFLARE_R2_SECRET_KEY`
6. Get your **Account ID** from the R2 dashboard (top right, under your account name)
7. Set up a **Public Domain** (for `NEXT_PUBLIC_R2_PUBLIC_URL`):
   - In your bucket settings, go to **Settings** → **Public Access**
   - Click **Connect Domain** or use the default R2.dev domain
   - Format: `https://pub-xxxxx.r2.dev/flippin-images` (replace `xxxxx` with your domain ID)
8. Add all 5 variables to Vercel

**⚠️ Without these, image uploads will fail with "Image storage not configured" error**

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

## ✅ Required vs Optional

**Required for basic functionality:**
- `DATABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `ANTHROPIC_API_KEY` ⚠️ **REQUIRED** - For AI features (image analysis, listing generation, pricing)
- `CLOUDFLARE_R2_ACCOUNT_ID` ⚠️ **REQUIRED** - For image uploads
- `CLOUDFLARE_R2_ACCESS_KEY` ⚠️ **REQUIRED** - For image uploads
- `CLOUDFLARE_R2_SECRET_KEY` ⚠️ **REQUIRED** - For image uploads
- `CLOUDFLARE_R2_BUCKET_NAME` ⚠️ **REQUIRED** - For image uploads
- `NEXT_PUBLIC_R2_PUBLIC_URL` ⚠️ **REQUIRED** - For image uploads

**Optional (can add later):**
- `NEXT_PUBLIC_APP_URL` - Can set after first deployment
- `NODE_ENV` - Vercel sets this automatically
- `RESEND_API_KEY` - Only needed for real email sending

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

