# Next Steps - Development Roadmap

**Date:** January 2025  
**Status:** Ready to build core features

---

## ✅ What's Complete

### Foundation
- ✅ Project setup (Next.js, TypeScript, Tailwind)
- ✅ Database schema (all models defined)
- ✅ AI functions (vision, pricing, matching, listing generator)
- ✅ Image upload to Cloudflare R2
- ✅ Homepage UI
- ✅ Sell page UI (complete flow)
- ✅ All UI components

### API Routes
- ✅ `/api/upload` - Image upload
- ✅ `/api/listings/analyze` - AI analysis

---

## 🚨 Critical Missing Piece

### `/api/listings/create` - **PRIORITY #1**

**Why it's critical:**
- The sell page calls this endpoint but it doesn't exist
- This is the core functionality that creates listings and generates instant offers
- Without it, the entire seller flow is broken

**What it needs to do:**
1. Create `Listing` record in database
2. Find active instant buyers in the listing's category
3. Calculate instant offers for each buyer
4. Create `InstantOffer` records
5. Return listing + offers to frontend

**Estimated time:** 2-3 hours

---

## 🎯 Recommended Build Order

### Phase 1: Complete Seller Flow (Week 1)

#### 1. Create Listing API (`/api/listings/create`)
**Priority: CRITICAL**

```typescript
POST /api/listings/create
Body: {
  imageUrls: string[]
  confirmedDetails: {
    brand, model, variant, category, condition, 
    askingPrice, title, description, detailedSpecs
  }
  province: Province
  city: string
  onMarketplace: boolean
  sentToBuyerNetwork: boolean
}

Returns: {
  listing: Listing
  instantOffers: InstantOffer[]
}
```

**Implementation steps:**
1. Get or create seller user (for now, use test user)
2. Find category by name
3. Generate listing copy (title, description)
4. Create listing with DRAFT status
5. Find active instant buyers in category
6. For each buyer:
   - Get market price from pricing data
   - Calculate offer using `calculateInstantOffer()`
   - Create InstantOffer record
7. Return listing + offers

#### 2. Finalize Listing API (`/api/listings/finalize`)
**Priority: HIGH**

```typescript
POST /api/listings/finalize
Body: {
  listingId: string
  selectedOfferId?: string  // If accepting instant offer
  distribution: {
    marketplace: boolean
    buyerNetwork: boolean
  }
}

Returns: {
  listing: Listing (updated status)
  transaction?: Transaction  // If instant offer accepted
}
```

**Implementation:**
- Update listing status to PENDING_APPROVAL
- Update distribution options
- If instant offer selected:
  - Create Transaction
  - Update InstantOffer status to ACCEPTED
  - Update Listing status to SOLD

#### 3. Authentication Pages
**Priority: HIGH**

- `/login` - Email magic link
- `/signup` - Registration
- `/auth/callback` - Handle Supabase auth callback
- User profile setup (first time)

**Why now:**
- Need real users for listings
- Can't use test users forever
- Required for seller flow to work properly

---

### Phase 2: Marketplace (Week 2)

#### 4. Browse Page (`/browse`)
**Priority: HIGH**

- List all ACTIVE listings
- Filters: category, price range, condition, province
- Search functionality
- Pagination
- Sort by: newest, price (low/high), condition

#### 5. Listing Detail Page (`/listing/[id]`)
**Priority: HIGH**

- Full listing details
- Image gallery
- Seller info & rating
- Make offer button
- Buy now button (if available)
- Share functionality

#### 6. Make Offer API (`/api/offers/create`)
**Priority: MEDIUM**

- Create Offer record
- Notify seller
- Handle offer expiration

---

### Phase 3: Transactions & Payments (Week 3)

#### 7. Checkout Flow
- Payment instructions
- Proof of payment upload
- Payment verification (manual for MVP)

#### 8. Shipping Flow
- Seller ships item
- Tracking number entry
- Delivery confirmation
- 48-hour inspection period

#### 9. Escrow Release
- Auto-release after 48 hours
- Manual release on buyer confirmation
- Dispute handling

---

### Phase 4: Admin & Management (Week 4)

#### 10. Admin Dashboard
- Approve/reject listings
- Approve instant buyers
- Manage transactions
- View ledger
- Platform settings

#### 11. User Dashboard
- My listings
- My offers
- My transactions
- Profile settings

---

## 🔧 Technical Decisions Needed

### 1. User Management
**Question:** How do we handle users before auth is complete?

**Options:**
- A) Use test user for now (quick, but not production-ready)
- B) Build auth first (slower, but proper)
- C) Allow anonymous listings (complex, but flexible)

**Recommendation:** Option A for MVP, then B

### 2. Category Matching
**Question:** How do we match listings to instant buyers?

**Current:** Categories stored as string[] in InstantBuyer
**Need:** Find buyers where categoryId is in their categories array

**Implementation:**
```typescript
const instantBuyers = await prisma.instantBuyer.findMany({
  where: {
    active: true,
    approved: true,
    categories: { has: categoryId }
  },
  include: { user: true }
});
```

### 3. Market Price Source
**Question:** Where do we get market price for instant offers?

**Current:** Pricing comes from AI analysis
**Need:** Store pricing.recommended in listing or use it from analysis

**Recommendation:** Use `pricing.recommended` from analysis, store in `listing.aiSuggestedPrice`

---

## 📝 Implementation Notes

### Listing Creation Flow

```typescript
// 1. Validate input
// 2. Get/create user (for now: test user)
const seller = await getOrCreateTestSeller();

// 3. Find category
const category = await prisma.category.findFirst({
  where: { name: confirmedDetails.category }
});

// 4. Generate listing copy
const listingCopy = await generateListingCopy(
  visionAnalysis,
  confirmedDetails.userNotes
);

// 5. Create listing
const listing = await prisma.listing.create({
  data: {
    sellerId: seller.id,
    status: 'DRAFT',
    title: listingCopy.title,
    description: listingCopy.description,
    categoryId: category.id,
    condition: confirmedDetails.condition,
    brand: confirmedDetails.brand,
    model: confirmedDetails.model,
    variant: confirmedDetails.variant,
    askingPrice: confirmedDetails.askingPrice,
    aiSuggestedPrice: pricing?.recommended,
    images: imageUrls,
    province: province,
    city: city,
    onMarketplace: false, // Set later
    sentToBuyerNetwork: false, // Set later
    aiAnalysis: visionAnalysis,
    detailedSpecs: confirmedDetails.detailedSpecs,
    sellerConfirmed: true,
  }
});

// 6. Find instant buyers
const instantBuyers = await prisma.instantBuyer.findMany({
  where: {
    active: true,
    approved: true,
    categories: { has: category.id }
  },
  include: { user: true }
});

// 7. Generate offers
const offers = [];
for (const buyer of instantBuyers) {
  const marketPrice = pricing?.recommended || confirmedDetails.askingPrice;
  const conditionRules = buyer.conditionRules as Record<string, number>;
  
  const offer = calculateInstantOffer(
    marketPrice,
    confirmedDetails.condition,
    Number(buyer.baseOffer),
    conditionRules
  );
  
  const instantOffer = await prisma.instantOffer.create({
    data: {
      listingId: listing.id,
      buyerId: buyer.id,
      sellerReceives: offer.sellerReceives,
      buyerPays: offer.buyerPays,
      platformFee: offer.platformFee,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    }
  });
  
  offers.push({
    ...instantOffer,
    buyer: { user: buyer.user, companyName: buyer.companyName }
  });
}

// 8. Return
return { listing, instantOffers: offers };
```

---

## 🎯 Immediate Next Steps

1. **Build `/api/listings/create`** (2-3 hours)
   - This unblocks the entire seller flow
   - Critical for testing

2. **Build `/api/listings/finalize`** (1-2 hours)
   - Completes the seller flow
   - Handles distribution options

3. **Test full seller flow** (1 hour)
   - Upload images
   - Get AI analysis
   - Create listing
   - See instant offers
   - Finalize listing

4. **Build authentication** (3-4 hours)
   - Login/signup pages
   - Supabase integration
   - User profile

5. **Build marketplace browse** (4-5 hours)
   - Browse page
   - Filters
   - Search

---

## 💡 Business Logic Reminders

### Instant Offers
- Base offer % from buyer (e.g., 60%)
- Condition multipliers: NEW (+10%), LIKE_NEW (+5%), GOOD (0%), FAIR (-15%), POOR (-30%)
- Platform fee: 5% from buyer
- Round to nearest R50

### Marketplace Fees
- Under R1,000: FREE
- Over R1,000: 5.5% from seller
- Shipping: Seller pays, reimbursed

### Transaction Flow
- Payment → Escrow → Shipping → Delivery → 48hr inspection → Release

---

## 📊 Success Metrics

### Phase 1 Complete When:
- ✅ Seller can upload images
- ✅ AI analyzes product
- ✅ Listing created in database
- ✅ Instant offers generated
- ✅ Seller can finalize listing

### Phase 2 Complete When:
- ✅ Users can browse listings
- ✅ Users can view listing details
- ✅ Users can make offers

### Phase 3 Complete When:
- ✅ Transactions can be created
- ✅ Payments can be processed
- ✅ Shipping can be tracked
- ✅ Money can be released

---

**Let's start with the listing creation API - it's the foundation for everything else!**

