# Flippin - Business Logic Reference

**Last Updated:** January 2025  
**Purpose:** Complete reference for all business rules and logic

---

## 🎯 Core Business Model

Flippin is a **dual-marketplace** platform:
1. **Traditional Marketplace** - Sellers list, buyers browse and make offers
2. **Instant Buyer Network** - Pre-approved buyers make instant cash offers
3. **Buy Orders** - Reverse marketplace (buyers post what they want)

---

## 💰 Pricing & Fees

### Marketplace Fees
- **Under R1,000:** FREE (no platform fee)
- **Over R1,000:** 5.5% commission from seller
- **Shipping:** Seller pays upfront (typically R150), reimbursed from sale proceeds

**Example:**
- Item sells for R2,000
- Platform fee: R2,000 × 5.5% = R110
- Shipping: R150 (reimbursed)
- Seller receives: R2,000 - R110 = R1,890
- Buyer pays: R2,000 + R150 shipping = R2,150

### Instant Offers
- **Base Offer:** Set by instant buyer (e.g., 60% of market value)
- **Condition Multipliers:**
  - NEW: +10% (multiplier: 1.10)
  - LIKE_NEW: +5% (multiplier: 1.05)
  - GOOD: 0% (multiplier: 1.0)
  - FAIR: -15% (multiplier: 0.85)
  - POOR: -30% (multiplier: 0.70)

- **Platform Fee:** 5% from buyer (not seller)
- **Seller sees:** Gross amount they'll receive (no fees deducted)

**Calculation Formula:**
```
sellerReceives = marketPrice × baseOffer × conditionMultiplier (rounded to nearest R50)
platformFee = sellerReceives × 0.05
buyerPays = sellerReceives + platformFee
```

**Example:**
- Market price: R10,000
- Base offer: 60% (0.60)
- Condition: GOOD (multiplier: 1.0)
- Seller receives: R10,000 × 0.60 × 1.0 = R6,000
- Platform fee: R6,000 × 0.05 = R300
- Buyer pays: R6,300

**Example (NEW condition):**
- Market price: R10,000
- Base offer: 60% (0.60)
- Condition: NEW (multiplier: 1.10)
- Seller receives: R10,000 × 0.60 × 1.10 = R6,600
- Platform fee: R6,600 × 0.05 = R330
- Buyer pays: R6,930

---

## 📦 Listing Flow

### Status Progression
1. **DRAFT** - Seller is creating listing
2. **PENDING_APPROVAL** - Submitted, awaiting admin review
3. **ACTIVE** - Live on marketplace/buyer network
4. **SOLD** - Transaction completed
5. **EXPIRED** - Listing expired (30 days default)
6. **REMOVED** - Admin removed or seller deleted

### Distribution Options
Sellers choose how to distribute their listing:
1. **Marketplace Only** - Maximum exposure, potential for higher price
2. **Buyer Network Only** - Quick sale via instant offers
3. **Both** - Best of both worlds (can accept instant offer or wait for marketplace sale)

---

## 🤖 AI Analysis System

### Vision Analysis
- Detects: Brand, model, variant, category, condition
- Checks: Authenticity, prohibited items, oversized items
- Assesses: Confidence level, needs more info flag
- Generates: Suggested questions if info is unclear

### Pricing Engine
- Uses web search for live SA market data
- Sources: Gumtree, Facebook Marketplace, Takealot
- Considers: Condition, demand, competition, time of year
- Returns: Recommended price, range, confidence, market insights

### Listing Copy Generator
- Generates witty, professional descriptions
- SEO-optimized titles
- Category-specific formatting

---

## ⚡ Instant Offers System

### How It Works
1. Seller creates listing
2. System finds active instant buyers in that category
3. For each buyer:
   - Calculate offer based on market price × base offer × condition multiplier
   - Create `InstantOffer` record with PENDING status
   - Offer expires in 48 hours (default)
4. Seller sees all competing offers
5. Seller can accept one or list on marketplace

### Instant Buyer Requirements
- Must be approved by admin
- Must be active (not paused)
- Must have categories configured
- Must have base offer % set
- Can customize condition multipliers

### Offer Status
- **PENDING** - Awaiting seller decision
- **ACCEPTED** - Seller accepted, transaction created
- **EXPIRED** - Offer expired (48 hours)
- **WITHDRAWN** - Buyer withdrew offer

---

## 🛒 Buy Orders (Reverse Marketplace)

### How It Works
1. Buyer creates buy order with:
   - What they want (title, description, category)
   - Acceptable conditions
   - Offer price (budget)
   - Provinces they'll accept from
2. Card is authorized (not charged)
3. AI matches listings to buy orders
4. When match found:
   - Buyer notified
   - Card charged
   - Transaction created
   - 48-hour inspection period after delivery

### Matching Logic
- AI scores listing vs buy order (0.0-1.0)
- Considers: Item type, condition, price vs budget
- Auto-notifies on matches > 0.8 score

---

## 💳 Transaction Flow

### Status Progression
1. **CREATED** - Transaction created
2. **PAYMENT_PENDING** - Awaiting buyer payment
3. **PAID** - Payment confirmed, held in escrow
4. **SHIPPED** - Seller shipped item
5. **DELIVERED** - Item delivered to buyer
6. **INSPECTION_PERIOD** - 48-hour inspection window
7. **COMPLETED** - Money released to seller
8. **DISPUTED** - Buyer disputes item
9. **CANCELLED** - Transaction cancelled
10. **REFUNDED** - Money refunded to buyer

### Payment Flow
1. Buyer pays (bank transfer or card)
2. Upload proof of payment
3. Admin verifies (manual for MVP)
4. Payment status: VERIFIED
5. Money held in escrow
6. Seller ships item
7. Buyer confirms delivery OR 48 hours pass
8. Money released to seller

### Escrow System
- Money held in platform account
- Released 48 hours after delivery (or on buyer confirmation)
- Can be disputed during inspection period
- Platform handles refunds if needed

---

## 🚚 Shipping

### Options
1. **Paxi** - Courier service
2. **Door-to-Door** - Direct courier

### Process
1. Estimated R150 included in listing price
2. Seller pays shipping upfront
3. Seller ships within 48 hours of payment
4. Seller enters tracking number
5. Buyer receives item
6. 48-hour inspection period
7. Shipping cost reimbursed to seller from sale proceeds

---

## 👥 User Types

### PERSONAL_SELLER
- Can create listings
- Can receive offers
- Can accept instant offers
- Pays marketplace fees (if over R1,000)

### PERSONAL_BUYER
- Can browse marketplace
- Can make offers
- Can create buy orders
- Pays for items + shipping

### BUSINESS_SELLER
- Same as personal seller
- Can have company name
- May have different verification requirements

### INSTANT_BUYER
- Pre-approved by admin
- Makes instant cash offers
- Pays 5% platform fee
- Can pause/resume offers
- Has category restrictions

### ADMIN
- Approves/rejects listings
- Approves instant buyers
- Manages disputes
- Views ledger
- Edits platform settings

---

## 🔐 Verification Levels

### BASIC
- Email verified
- Can list items
- Limited features

### VERIFIED
- ID document uploaded
- Phone verified
- Full marketplace access

### PREMIUM
- Enhanced verification
- Priority support
- Lower fees (future)

### BUSINESS
- Company registration
- CIPC number verified
- Business banking details

---

## 📊 Platform Settings (Editable by Admin)

- **Marketplace Rate:** 5.5% (default)
- **Free Threshold:** R1,000 (default)
- **Instant Offer Rate:** 5% (default)
- **Escrow Release Days:** 2 days (48 hours)
- **Platform Bank Details:** For receiving payments

---

## 🚫 Prohibited Items

Items that cannot be sold:
- Weapons, firearms, ammunition
- Drugs, narcotics, prescription medication
- Alcohol, tobacco, vaping products
- Animals, pets, livestock
- Stolen goods, counterfeits
- Adult/inappropriate content
- Hazardous materials

### Oversized Items (Too Large for Courier)
- Vehicles (cars, motorcycles, boats)
- Large furniture (couches, beds, desks)
- Large appliances (refrigerators, washing machines, stoves)

---

## 📈 Key Metrics & Stats

### Seller Stats
- Total sales
- Average sale price
- Rating
- Response time

### Buyer Stats
- Total purchases
- Average purchase price
- Rating
- Dispute rate

### Platform Stats
- Total transactions
- Platform revenue
- Average transaction value
- Conversion rates

---

## 🔄 Notification System

### Notification Types
- BUY_ORDER_MATCHED
- INSTANT_OFFER_RECEIVED
- OFFER_RECEIVED
- OFFER_ACCEPTED
- PAYMENT_CONFIRMED
- ITEM_SHIPPED
- ITEM_DELIVERED
- ITEM_SOLD
- PAYMENT_RELEASED
- VERIFICATION_COMPLETE
- MESSAGE_RECEIVED
- REVIEW_RECEIVED
- LISTING_APPROVED
- LISTING_REJECTED

### Channels
- Email
- SMS (future)
- Push notifications (future)
- In-app notifications

---

## 💾 Ledger (Audit Trail)

All financial transactions are logged:
- BUYER_PAYMENT
- SELLER_PAYOUT
- PLATFORM_FEE
- REFUND
- SHIPPING_REIMBURSEMENT

Each entry tracks:
- Amount
- From/To users
- Transaction reference
- Payment method
- Status (PENDING, COMPLETED, FAILED, CANCELLED)

---

## 🎯 Competitive Advantages

1. **Free Under R1,000** - Undercuts all competitors
2. **Instant Offers** - No waiting for buyers
3. **AI Pricing** - Always fair, data-driven
4. **Buy Orders** - Reverse marketplace (unique)
5. **Fast Payments** - 48-hour escrow release
6. **Witty UX** - Fun, not boring like competitors

---

## 📝 Notes for Development

### Current Implementation Status
- ✅ AI vision analysis
- ✅ AI pricing engine
- ✅ Instant offer calculation
- ✅ Database schema
- ✅ Image upload
- ⏳ Listing creation API (in progress)
- ⏳ Authentication
- ⏳ Marketplace browse
- ⏳ Transaction flow
- ⏳ Admin dashboard

### Business Logic Validation
All calculations should be:
- Rounded to nearest R50 for instant offers
- Rounded to 2 decimal places for fees
- Validated against platform settings
- Logged in ledger for audit

---

**This document should be updated whenever business logic changes.**

