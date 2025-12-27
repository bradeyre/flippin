# Flippin - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies

```bash
cd /Users/Focus/Library/Mobile\ Documents/com~apple~CloudDocs/Business/Flippin/Code/flippin
npm install
```

### Step 2: Set Up Environment

Create a `.env` file in the project root. For now, you can use dummy values to test the UI:

```bash
# Minimal .env for testing UI
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/flippin"
NEXT_PUBLIC_SUPABASE_URL="https://dummy.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="dummy-key"
SUPABASE_SERVICE_ROLE_KEY="dummy-key"
ANTHROPIC_API_KEY="dummy-key"
CLOUDFLARE_R2_ACCOUNT_ID="dummy"
CLOUDFLARE_R2_ACCESS_KEY="dummy"
CLOUDFLARE_R2_SECRET_KEY="dummy"
CLOUDFLARE_R2_BUCKET_NAME="flippin-images"
NEXT_PUBLIC_R2_PUBLIC_URL="https://images.flippin.co.za"
NEXT_PUBLIC_URL="http://localhost:3000"
NODE_ENV="development"
```

### Step 3: Run the App

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

---

## ✅ What Works Right Now (Without Services)

### You Can Test:
1. **Homepage** - Fully working, looks great!
2. **Sell Page UI** - Complete flow from upload to offers (UI only)
3. **All Components** - Image upload, questions, analysis, offers

### What Needs Real Services:
- Image upload (needs Cloudflare R2)
- AI analysis (needs Anthropic API)
- Database (needs Supabase)
- Authentication (needs Supabase)

---

## 🎯 To Get FULLY Working

### 1. Set Up Supabase (5 minutes)

1. Go to https://supabase.com
2. Create new project
3. Wait 2-3 minutes for setup
4. Copy the connection details to `.env`

### 2. Set Up Anthropic (2 minutes)

1. Go to https://console.anthropic.com
2. Create API key
3. Add $20 credits
4. Copy key to `.env`

### 3. Set Up Cloudflare R2 (5 minutes)

1. Go to Cloudflare Dashboard → R2
2. Create bucket `flippin-images`
3. Create API token
4. Enable public access
5. Copy credentials to `.env`

### 4. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Create all tables
npx prisma db push

# Add seed data (categories, Epic Deals, test users)
npm run db:seed
```

---

## 🎨 What's Been Built

### Pages
- ✅ **Homepage** (`/`) - Fully designed with witty copy
- ✅ **Sell Page** (`/sell`) - Complete 5-step flow

### Components
- ✅ `ImageUpload` - Drag & drop, mobile camera support
- ✅ `AIAnalysis` - Shows AI detection results
- ✅ `QualifyingQuestions` - Dynamic category-based questions
- ✅ `InstantOffers` - Display competing instant offers
- ✅ `DistributionOptions` - Three selling options

### API Routes
- ✅ `/api/upload` - Image upload to R2
- ✅ `/api/listings/analyze` - AI vision + pricing
- ✅ `/api/listings/create` - Full listing creation with instant offers

### Database
- ✅ Complete schema with all models
- ✅ Seed data with categories & Epic Deals
- ✅ Qualifying questions per category

---

## 📊 Seed Data Includes

- **10 Categories:**
  - Electronics → Smartphones, Laptops, Gaming, Cameras
  - Fashion → Sneakers, Watches
  - Home & Kitchen
  - Sports & Outdoors → Tools

- **Test Accounts:**
  - Admin: `brad@eyre.co.za`
  - Test Seller: `seller@test.com`
  - Epic Deals: `epicdeals@flippin.co.za` (instant buyer)

- **Epic Deals Config:**
  - Base offer: 60% of market value
  - Active in: Smartphones, Laptops, Gaming, Cameras, Tools
  - Condition adjustments built in

---

## 🎯 Try The Sell Flow

1. Go to http://localhost:3000
2. Click "Sell Something"
3. Upload 3-5 photos (any images work for UI testing)
4. See the full flow:
   - Upload → Analyzing → Questions → Confirm → Offers → Distribution

**Note:** Without real API keys, the AI analysis won't work, but you can see the complete UI flow!

---

## 🔥 What Makes This Special

### Instant Offers System
- Epic Deals configured to buy at 60% + condition adjustments
- 5% platform fee from buyer
- Sellers see exact amount they'll receive
- Multiple buyers can compete

### Distribution Options
1. **Marketplace only** - Max exposure
2. **Buyer network only** - Quick sale
3. **Both** - Best of both worlds

### Smart Qualifying Questions
Each category has custom questions:
- **Smartphones:** Battery health, screen condition, iCloud status
- **Laptops:** RAM, storage, keyboard condition
- **Tools:** Working condition, accessories

### AI-Powered
- Vision detects product from photos
- Live market pricing via web search
- Auto-generated descriptions
- Match scoring for buy orders

---

## 🚀 Next: I'm Building

1. **Browse/Marketplace** - Search, filters, listing pages
2. **Buy Orders** - Stock exchange for buyers
3. **Admin Dashboard** - Manage everything
4. **Checkout Flow** - Payments & shipping
5. **Stats/Depreciation** - Market data goldmine

---

## 💬 Questions?

The codebase is fully commented and organized. Every component does one thing well.

- **Need help?** Email brad@eyre.co.za
- **Want to customize?** Everything is in plain TypeScript/React
- **Ready to deploy?** Works on Vercel with zero config

**Let's build something Flippin' amazing! 🔥**
