# Flippin - Setup Guide

## 🎯 What We've Built So Far

A complete AI-powered marketplace platform with:

- ✅ Next.js 14 + TypeScript + Tailwind CSS
- ✅ Prisma database schema (complete with all models)
- ✅ AI vision analysis (Claude Sonnet)
- ✅ AI pricing engine with live web search
- ✅ AI listing copy generation
- ✅ Buy order matching system
- ✅ Instant offer calculation
- ✅ Image upload to Cloudflare R2
- ✅ Supabase authentication ready
- ✅ Core API routes for listing creation

## 📋 Prerequisites

Before you can run Flippin, you need accounts for:

1. **Supabase** (database + auth) - https://supabase.com
2. **Anthropic** (Claude AI) - https://console.anthropic.com
3. **Cloudflare R2** (image storage) - https://cloudflare.com/products/r2

## 🚀 Setup Instructions

### Step 1: Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Wait for the database to initialize (2-3 minutes)
3. Go to Project Settings → API
4. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

5. Go to Project Settings → Database
6. Copy `Connection String` → `DATABASE_URL`
   - Change `[YOUR-PASSWORD]` to your actual database password
   - Add `?pgbouncer=true&connection_limit=1` at the end$

### Step 2: Set Up Anthropic

1. Go to https://console.anthropic.com
2. Create an API key
3. Copy it → `ANTHROPIC_API_KEY`

### Step 3: Set Up Cloudflare R2

1. Go to Cloudflare Dashboard → R2
2. Create a new bucket called `flippin-images`
3. Go to R2 → Manage R2 API Tokens → Create API Token
4. Create token with "Edit" permissions
5. Copy:
   - `Account ID` → `CLOUDFLARE_R2_ACCOUNT_ID`
   - `Access Key ID` → `CLOUDFLARE_R2_ACCESS_KEY`
   - `Secret Access Key` → `CLOUDFLARE_R2_SECRET_KEY`

6. Set up public access:
   - Go to your bucket → Settings → Public Access
   - Enable public access
   - Custom domain: `images.flippin.co.za` (or use Cloudflare's public URL)
   - Copy public URL → `NEXT_PUBLIC_R2_PUBLIC_URL`

### Step 4: Create .env File

Create a `.env` file in the project root:

\`\`\`bash
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Anthropic AI
ANTHROPIC_API_KEY="sk-ant-..."

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"
CLOUDFLARE_R2_ACCESS_KEY="your-access-key"
CLOUDFLARE_R2_SECRET_KEY="your-secret-key"
CLOUDFLARE_R2_BUCKET_NAME="flippin-images"
NEXT_PUBLIC_R2_PUBLIC_URL="https://images.flippin.co.za"

# App
NEXT_PUBLIC_URL="http://localhost:3000"
NODE_ENV="development"
\`\`\`

### Step 5: Initialize Database

Run these commands in order:

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates all tables)
npx prisma db push

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
\`\`\`

### Step 6: Run the App

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000

## 🎨 What's Next?

I'm building:

1. **Sell Page** - Upload images → AI analysis → Instant offers
2. **Browse Page** - Marketplace listings
3. **Buy Orders** - Stock exchange model for buyers
4. **Admin Dashboard** - Manage everything
5. **Buyer Dashboard** - For instant offer companies
6. **Checkout Flow** - Payments + shipping
7. **Messaging** - Buyer-seller chat
8. **Reviews** - Rating system

## 📝 Current Status

**WORKING:**
- Homepage (with witty copy!)
- Database schema
- AI vision, pricing, matching
- API for creating listings
- Image upload

**IN PROGRESS:**
- Sell page UI
- Authentication flow
- Instant offer display

**TODO:**
- Everything else!

## 🐛 Troubleshooting

### "Module not found" errors
\`\`\`bash
npm install
\`\`\`

### Prisma errors
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### Can't connect to Supabase
- Check your `.env` file has correct values
- Make sure DATABASE_URL has `?pgbouncer=true` at the end

### AI errors (ANTHROPIC_API_KEY)
- Make sure your Anthropic API key is valid
- Check you have credits in your account

## 📞 Questions?

Email: brad@eyre.co.za

---

**Let's build something Flippin' amazing! 🔥**
