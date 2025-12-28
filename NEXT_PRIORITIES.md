# Next Priorities - Flippin Development Roadmap

**Last Updated:** January 2025

---

## 🎯 Critical Path (Complete the Core Flow)

### 1. **Checkout & Payment UI** ⚡ HIGHEST PRIORITY
**Status:** API ready, UI missing

**What's needed:**
- `/checkout/[transactionId]` - Checkout page
  - Payment method selection (EFT vs Card)
  - Card payment form (Stripe/Paystack integration)
  - EFT bank details display
  - Order summary with fee breakdown
  - Success/error handling

**Why critical:** Buyers can't complete purchases without this

**Estimated effort:** 4-6 hours

---

### 2. **Make Offer Flow** ⚡ HIGH PRIORITY
**Status:** Button exists, not connected

**What's needed:**
- Connect "Make Offer" button on listing page
- `/listing/[id]/offer` - Offer form page
  - Offer amount input
  - Message field
  - Offer expiration info
  - Submit to `/api/offers/create`
- Offer confirmation page
- Email notification to seller

**Why critical:** Core marketplace functionality

**Estimated effort:** 3-4 hours

---

### 3. **Transaction Detail Pages** ⚡ HIGH PRIORITY
**Status:** List exists, detail pages missing

**What's needed:**
- `/dashboard/transactions/[id]` - Transaction detail
  - Full transaction info
  - Payment status
  - Shipping tracking
  - Actions (confirm delivery, dispute, etc.)
  - Fee breakdown (for sellers)
- `/buyer/dashboard/transactions/[id]` - Buyer view

**Why critical:** Users need to manage individual transactions

**Estimated effort:** 3-4 hours

---

### 4. **Shipping Management** ⚡ HIGH PRIORITY
**Status:** Database ready, UI missing

**What's needed:**
- Seller can add tracking number
- `/dashboard/transactions/[id]/ship` - Shipping form
  - Tracking number input
  - Courier selection
  - Update transaction status
  - Email notification to buyer
- Auto-update delivery status when tracking updates

**Why critical:** Sellers need to ship items

**Estimated effort:** 2-3 hours

---

### 5. **Messaging UI** ⚡ MEDIUM PRIORITY
**Status:** APIs ready, UI missing

**What's needed:**
- `/messages` - Conversations list
- `/messages/[userId]` - Chat interface
  - Message history
  - Send new message
  - Real-time updates (or polling)
  - Link to listing if conversation is about a listing

**Why critical:** Buyers and sellers need to communicate

**Estimated effort:** 4-5 hours

---

## 🔧 Integration & Polish

### 6. **Email Integration (Resend)**
**Status:** Templates ready, not sending

**What's needed:**
- Set up Resend account
- Add `RESEND_API_KEY` to environment
- Update `lib/email/sender.ts` to actually send emails
- Test all email templates

**Estimated effort:** 1-2 hours

---

### 7. **Card Payment Integration**
**Status:** Structure ready, not connected

**What's needed:**
- Choose provider (Stripe or Paystack for SA)
- Set up account and get API keys
- Add keys to environment
- Update `processCardPayment()` function
- Add card tokenization on frontend
- Test payment flow

**Estimated effort:** 3-4 hours

---

### 8. **EFT Payment Verification**
**Status:** Manual process needed

**What's needed:**
- Admin UI to verify EFT payments
- `/admin/transactions/[id]` - Verify payment
  - View payment reference
  - Mark as verified
  - Update transaction status
  - Notify seller to ship
- Or: Bank API integration for auto-verification

**Estimated effort:** 2-3 hours (manual) or 8-10 hours (auto)

---

## 📊 Admin Enhancements

### 9. **Admin Transaction Management**
**Status:** API ready, UI missing

**What's needed:**
- `/admin/transactions` - Full transaction list
  - Filter by status, payment method, date
  - Verify payments
  - Handle disputes
  - Release escrow
  - Export data

**Estimated effort:** 3-4 hours

---

### 10. **Admin Settings Page**
**Status:** API ready, UI missing

**What's needed:**
- `/admin/settings` - Platform settings
  - Commission rates
  - Bank details
  - Escrow settings
  - Email templates editor

**Estimated effort:** 2-3 hours

---

## 🚀 Nice-to-Have (Post-MVP)

### 11. **Buy Orders UI**
- Create buy order page
- Browse buy orders for sellers
- Matching notifications

### 12. **Reviews & Ratings**
- Review prompts after delivery
- Rating display on profiles
- Review management

### 13. **Notifications System**
- In-app notifications
- Email preferences
- Real-time updates

### 14. **Search Improvements**
- Full-text search
- Autocomplete
- Search history

### 15. **Mobile App**
- React Native app
- Push notifications
- Camera integration

---

## 📋 Recommended Build Order

**Week 1: Complete Core Flow**
1. Checkout & Payment UI
2. Make Offer Flow
3. Transaction Detail Pages
4. Shipping Management

**Week 2: Communication & Integration**
5. Messaging UI
6. Email Integration
7. Card Payment Integration
8. EFT Verification

**Week 3: Admin & Polish**
9. Admin Transaction Management
10. Admin Settings
11. Testing & Bug Fixes
12. Performance Optimization

---

## 🎯 Immediate Next Steps

**Start with #1 - Checkout & Payment UI**

This is the critical blocker. Once buyers can complete purchases, the entire flow works end-to-end.

Then move to #2 - Make Offer Flow, so buyers can negotiate prices.

These two will make the marketplace fully functional!

